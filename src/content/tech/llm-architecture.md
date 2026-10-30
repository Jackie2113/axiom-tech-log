---
title: "Large Language Models: Inside the Transformer and Beyond"
date: 2026-10-30
category: "AI & Systems"
maturity: "Production-Ready"
summary: "How modern LLMs work down to the tensor level—from tokenization, RoPE, and KV caches to Mixture-of-Experts, test-time reasoning, system metrics, and how every major lab's architecture differs."
architectureImage: "/images/llm-transformer-stack.svg"
architectureCaption: "The modern decoder-only Transformer stack: byte-level BPE tokenizer, embedding lookup, N layers of RMSNorm, Grouped-Query or Multi-Head Latent Attention with RoPE and KV caching, SwiGLU or Sparse MoE feed-forward blocks, and the final unembedding head."
youtubeId: "wjZofJX0v4M"
references:
  - title: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
  - title: "The Llama 3 Herd of Models (Meta AI)"
    url: "https://arxiv.org/abs/2407.21783"
  - title: "DeepSeek-V3 Technical Report (DeepSeek-AI)"
    url: "https://arxiv.org/abs/2412.19437"
  - title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via RL"
    url: "https://arxiv.org/abs/2501.12948"
  - title: "FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision"
    url: "https://arxiv.org/abs/2407.08608"
  - title: "RoFormer: Enhanced Transformer with Rotary Position Embedding (Su et al.)"
    url: "https://arxiv.org/abs/2104.09864"
  - title: "Mamba-2: Transformers are SSMs (Dao & Gu)"
    url: "https://arxiv.org/abs/2405.21060"
---

*Updated October 30, 2026 · roughly a 18-minute read*

## Preface: the next-token engine

Strip away the chat interfaces, voice modes, and agentic wrappers, and every Large Language Model (LLM) is doing something deceptively simple: given a sequence of numbers representing text, images, or audio, it predicts a probability distribution over what token comes next.

Yet when you scale that objective across trillions of tokens and hundreds of billions of parameters, statistical compression turns into world modeling. To predict the next token in a complex C++ codebase or a physics derivation, the network cannot just memorize n-grams—it has to build internal representations of syntax, logic, state, and intent.

This piece breaks down the machinery underneath modern LLMs without the hype. We will trace a single token's journey through the modern Transformer stack, examine why memory bandwidth—not raw compute—is the real bottleneck, break down the metrics engineers actually use to measure speed and intelligence, and compare what OpenAI, Anthropic, Google, Meta, DeepSeek, Alibaba, and Mistral are actually building under the hood.

---

## Anatomy of a modern LLM: down to the tensor level

Almost every frontier LLM today is a **decoder-only Transformer** (or a hybrid of one). While the original 2017 *Attention Is All You Need* paper had both an encoder and a decoder for machine translation, modern models dropped the encoder and evolved every single component of the decoder block for training stability and inference speed.

Here is what happens inside the forward pass, layer by layer:

### 1. Tokenization (Byte-Pair Encoding)
Neural networks cannot ingest raw strings; they operate on vectors of continuous numbers. A tokenizer splits text into sub-word units called **tokens** using algorithms like **Byte-Level Byte-Pair Encoding (BPE)**.
* **How it works:** Starting from individual UTF-8 bytes (256 base tokens), the tokenizer iteratively merges the most frequent adjacent pairs of bytes in a massive training corpus until it reaches a fixed vocabulary size $V$.
* **Vocabulary scaling:** Early models like GPT-2 and Llama 2 used a vocabulary of $32,000$ to $50,257$ tokens. Modern models use much larger vocabularies—**128,256** in Llama 3, **~129,000** in DeepSeek-V3, **151,646** in Qwen, and **200,000+** in GPT-4o and Gemma. A larger vocabulary compresses more characters into a single token (improving speed and multilingual/code efficiency) at the cost of a heavier embedding matrix.

### 2. Embedding Lookup
Each token ID (an integer between $0$ and $V-1$) indexes into an **Embedding Matrix** $W_E \in \mathbb{R}^{V \times d_{\text{model}}}$. For a model with hidden dimension $d_{\text{model}} = 4096$ (typical for an 8B model) or $d_{\text{model}} = 8192$ to $16384$ (for 70B–400B+ models), each token becomes a dense vector of floating-point numbers.

### 3. Pre-Normalization with RMSNorm
The original 2017 Transformer applied `LayerNorm` *after* the attention and feed-forward sub-layers (Post-Norm), which caused gradient explosions in deep networks without careful warm-up. Modern LLMs universally use **Pre-Norm** (normalizing inputs *before* each sub-layer, leaving a clean residual stream highway for gradients) and replace standard `LayerNorm` with **RMSNorm** (Root Mean Square Normalization):

$$\text{RMSNorm}(x) = \frac{x}{\sqrt{\frac{1}{d}\sum_{i=1}^{d} x_i^2 + \epsilon}} \odot \gamma$$

By dropping the mean-centering step of standard LayerNorm, RMSNorm cuts memory-bound reduction operations and speeds up normalization by 10–15% with zero loss in accuracy.

### 4. Positional Encoding: RoPE (Rotary Position Embedding)
Because self-attention processes all tokens in parallel rather than sequentially like an RNN, it has no built-in sense of word order. Instead of adding fixed sinusoidal waves to the initial embeddings, modern LLMs apply **RoPE** directly inside every attention layer.
* **The mechanism:** RoPE pairs up dimensions of the Query ($Q$) and Key ($K$) vectors and rotates them in 2D complex space by an angle proportional to the token's position $m$ and a geometric progression of frequencies $\theta_i = b^{-2i/d}$.
* **Why it won:** The dot product $q_m^T k_n$ between a query at position $m$ and a key at position $n$ depends **only on their relative distance $(m - n)$**.
* **Context extension:** By increasing the base frequency $b$ (from $10,000$ up to $500,000$ or $10,000,000$) and applying frequency interpolation techniques like **YaRN** or **NTK-aware scaling**, engineers stretch context windows from 4,096 tokens out to 128K, 1M, or 2M tokens.

### 5. Self-Attention & The KV Cache Bottleneck
In causal self-attention, each token projects its hidden state $x$ into three vectors via learned weight matrices: **Query ($Q$)**, **Key ($K$)**, and **Value ($V$)**. Attention scores are computed as:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}} + M\right)V$$

where $M$ is a causal upper-triangular mask set to $-\infty$ so token $t$ cannot peek at future tokens $t+1$.

During generation, recomputing $K$ and $V$ for all previous tokens at every new step would be $O(N^2)$ redundant work. Instead, engines store past Keys and Values in GPU memory—the **KV Cache**. As context length $N$ and batch size grow, the KV cache balloons to tens or hundreds of gigabytes, making memory bandwidth (reading the KV cache from VRAM to SRAM for every generated token) the primary bottleneck of LLM inference.

To crush the KV cache footprint, attention evolved through four generations:

| Attention Variant | How It Works | KV Cache Size | Used By |
|---|---|---|---|
| **MHA** (Multi-Head) | Every Query head has its own dedicated Key and Value head (1:1 ratio). | 100% (Baseline) | GPT-3, Llama 1, early Transformers |
| **MQA** (Multi-Query) | All Query heads share a single Key head and a single Value head. | ~2% to 4% | PaLM, Falcon, StarCoder |
| **GQA** (Grouped-Query) | Query heads are grouped (e.g., 8 queries share 1 KV head), balancing MHA quality with MQA speed. | ~12.5% (at 8:1 ratio) | Llama 3/4, Qwen 2.5/3, Mistral |
| **MLA** (Multi-Head Latent) | Compresses Keys and Values jointly into a low-rank latent vector $c_t^{KV}$ before caching, then up-projects during compute. | ~5% to 7% | DeepSeek-V2, DeepSeek-V3, DeepSeek-R1 |

> Multi-Head Latent Attention (MLA) was one of the most consequential architectural leaps of the mid-2020s: it shrinks the KV cache even further than GQA while actually *outperforming* standard MHA in modeling capacity.

**FlashAttention (1, 2, and 3):** Even with compressed KV caches, standard attention materializes an $N \times N$ matrix in slow GPU High-Bandwidth Memory (HBM). **FlashAttention** rewrites the GPU kernel to tile $Q$, $K$, and $V$ into tiny blocks inside ultra-fast on-chip SRAM, using online softmax rescaling to compute exact attention without ever writing the $N \times N$ matrix to HBM.

<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/eMlx5fFNoYc" title="Attention in transformers, visually explained | 3Blue1Brown" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy" allowfullscreen></iframe></div>

*3Blue1Brown's visual breakdown of how Queries, Keys, and Values route information inside an attention head. [Watch on YouTube](https://www.youtube.com/watch?v=eMlx5fFNoYc).*

### 6. The Feed-Forward Network: SwiGLU vs. Sparse MoE
After attention mixes information *across* tokens, a Feed-Forward Network (FFN) processes each token *individually*, storing the majority of the model's factual knowledge.

* **SwiGLU Activation:** Modern LLMs replaced the classic two-layer ReLU MLP with a gated **SwiGLU** block using three weight matrices ($W_{\text{gate}}, W_{\text{up}}, W_{\text{down}}$):
  $$\text{SwiGLU}(x) = \left(\text{Swish}_{\beta}(x W_{\text{gate}}) \odot x W_{\text{up}}\right) W_{\text{down}}$$
  where $\text{Swish}(z) = z \cdot \sigma(z)$. Because it uses three matrices instead of two, the intermediate dimension is typically scaled to $\frac{8}{3}d_{\text{model}}$.
* **Sparse Mixture-of-Experts (MoE):** In a **Dense** model (like Llama 3.1 70B), 100% of parameters fire for every single token. In a **Sparse MoE** model, the single FFN block is split into $E$ distinct "expert" FFNs (ranging from 8 large experts in Mixtral 8x7B to **256 fine-grained routed experts + 1 shared expert** in DeepSeek-V3). A lightweight router network scores each token and activates only the top-$k$ experts.
  * **The result:** DeepSeek-V3 holds **671 billion total parameters** (massive knowledge capacity) but activates only **37 billion parameters per token** (inference speed and FLOP cost of a mid-sized model).

---

## How we got here: the architectural timeline

| Year | Milestone | Architectural Shift |
|---|---|---|
| **2017** | *Attention Is All You Need* (Google) | Replaces slow, sequential RNNs/LSTMs with parallelizable self-attention |
| **2018–2020** | GPT-1, GPT-2, GPT-3 (OpenAI) | Proves scaling decoder-only autoregression from 117M to 175B unlocks few-shot learning |
| **2022** | Chinchilla Scaling Laws (DeepMind) & FlashAttention | Shows models were under-trained on data ($20\text{ tokens per parameter}$ optimal for training compute); IO-aware kernels unlock long context |
| **2023** | Llama 1/2 (Meta) & Mixtral 8x7B (Mistral) | Standardizes the "Llama recipe" (RoPE + RMSNorm + SwiGLU + GQA) and open-weights Sparse MoE |
| **2024** | GPT-4o, Gemini 1.5 Pro, DeepSeek-V2/V3, o1 | Native multimodal tokenization, 1M+ context windows, Multi-Head Latent Attention (MLA), and RL-trained test-time reasoning |
| **2025–2026** | DeepSeek-R1, o3/GPT-5 era, Claude 4, Gemini 2.5, Qwen 3, Llama 4 | Open-weight reasoning via GRPO, native FP8 training, hybrid linear/SSM attention layers, and deep tool/MCP agent loops |

---

## Training pipeline: from raw web text to reasoning agents

Building a modern LLM happens in four distinct stages, each with its own objective function and compute profile:

1. **Pre-Training (95%+ of total compute):** The model trains via self-supervised cross-entropy loss on 10 trillion to 30+ trillion tokens of filtered web text, code, and synthetic math/STEM data. While Chinchilla laws say a 7B model is "compute-optimal" at ~140B tokens, modern labs deliberately **over-train** small models on 15T+ tokens (like Qwen 2.5/3 and Llama 3) so the resulting model is cheap and fast to run at inference time.
2. **Supervised Fine-Tuning (SFT) / Instruction Tuning:** A raw base model only completes documents; if you ask it a question, it might respond with five more questions. SFT trains the model on hundreds of thousands of curated `(prompt, ideal_response)` pairs, teaching chat templates, tool-calling schemas, and formatting.
3. **Preference Alignment (RLHF vs. DPO):**
   * **RLHF (PPO):** Trains a separate Reward Model on human preference rankings ($y_{\text{win}} \succ y_{\text{lose}}$), then optimizes the LLM using Proximal Policy Optimization with a KL-divergence penalty so it doesn't drift too far from the base model.
   * **DPO (Direct Preference Optimization):** Mathematically reparameterizes the reward function so the LLM can be optimized *directly* on preference pairs using a simple binary cross-entropy loss—eliminating the separate reward model and unstable RL loop.
4. **Reinforcement Learning with Verifiable Rewards (RLVR) & Test-Time Compute:** Pioneered by OpenAI's o1/o3 series and open-sourced in **DeepSeek-R1**, this stage trains the model on math, code, and logic problems where an automated grader (a compiler, unit test, or symbolic solver) provides an exact binary reward. Using **GRPO (Group Relative Policy Optimization)**—which samples a group of outputs for each prompt and uses their normalized group average as the baseline instead of a heavy critic model—the LLM autonomously discovers how to allocate **test-time compute**: generating thousands of internal Chain-of-Thought (`<think>`) tokens to test hypotheses, catch its own mistakes, and backtrack before outputting a final answer.

<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/kCc8FmEb1nY" title="Let's build GPT: from scratch, in code, spelled out. | Andrej Karpathy" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy" allowfullscreen></iframe></div>

*Andrej Karpathy building a decoder-only GPT from scratch in PyTorch—still the best hands-on walkthrough of how self-attention and autoregressive training wire together. [Watch on YouTube](https://www.youtube.com/watch?v=kCc8FmEb1nY).*

---

## Performance metrics: speed, hardware math, and intelligence

Evaluating an LLM requires separating **systems performance** (how fast and cheaply the weights run on silicon) from **model capability** (how smart the outputs are).

### Part 1: Systems & Inference Metrics

Every LLM request has two distinct hardware phases:
* **Prefill Phase (Compute-Bound):** The model ingests your entire prompt in parallel. Because it processes hundreds or thousands of tokens at once, GPU tensor cores perform **Matrix-Matrix Multiplication (GEMM)**, saturating compute FLOPs.
* **Decode Phase (Memory-Bandwidth-Bound):** The model generates output one token at a time. To generate *one* single token, the GPU must stream every active weight parameter and the entire KV cache from HBM into on-chip SRAM (**Matrix-Vector Multiplication, GEMV**). Your tokens-per-second speed is almost entirely dictated by GPU memory bandwidth (e.g., 3.35 TB/s on an H100 vs. 8 TB/s on a B200), not compute TFLOPs.

| System Metric | Definition | Why It Matters |
|---|---|---|
| **TTFT** (Time to First Token) | Time from sending the prompt to receiving the first output token (ms). | Measures **Prefill** efficiency and network latency; critical for responsive UI and voice agents. |
| **TPOT / ITL** (Time Per Output Token) | Average time between consecutive generated tokens (ms/token, or inverted as **Tokens/sec**). | Measures **Decode** memory bandwidth efficiency; humans read at ~5–8 tok/s, while coding agents need 100+ tok/s. |
| **KV Cache Footprint** | $\text{Bytes} = 2 \times n_{\text{layers}} \times n_{\text{kv\_heads}} \times d_{\text{head}} \times \text{seq\_len} \times \text{batch} \times \text{bytes\_per\_val}$ | Dictates how many concurrent users or how long a context window can fit in VRAM before Out-Of-Memory (OOM). |
| **MFU** (Model FLOPs Utilization) | Ratio of achieved throughput to the theoretical peak FLOPs of the GPU cluster. | Top training runs hit **40%–55% MFU**; the rest is lost to network communication (AllReduce/All-to-All) and memory stalls. |

**Quick VRAM Rule of Thumb:** To hold a model's weights in memory, multiply active storage bytes per parameter by the parameter count (plus ~20% overhead for KV cache and activations):
* **BF16 / FP16 (16-bit):** $2\text{ bytes/param}$ (A 70B model needs $\approx 140\text{ GB}$ just for weights).
* **FP8 (8-bit):** $1\text{ byte/param}$ (70B needs $\approx 70\text{ GB}$; supported natively on Hopper/Blackwell GPUs).
* **INT4 / AWQ / GGUF Q4_K_M (4-bit):** $0.5\text{ bytes/param}$ (70B fits in $\approx 38\text{ GB}$; an 8B model fits in $\approx 5.5\text{ GB}$ on a laptop GPU).

### Part 2: Capability & Evaluation Benchmarks

Because older benchmarks like standard MMLU (high-school/college multiple choice) and GSM8K (grade-school math) are now saturated at 90%+ and heavily contaminated in pre-training data, the industry relies on harder, contamination-resistant evaluations:

| Benchmark | Domain | What It Actually Tests |
|---|---|---|
| **Perplexity (PPL)** | Intrinsic Modeling | $\exp(\text{Cross-Entropy Loss})$. Measures how "surprised" a base model is by a held-out test corpus. Lower is better, though only comparable across models sharing the *exact same tokenizer*. |
| **GPQA Diamond** | PhD-Level Science | 198 questions written by domain PhDs in physics, chemistry, and biology that skilled non-experts with web access fail to answer. |
| **SWE-bench Verified** | Software Engineering | Gives an agent a real GitHub repo and an issue description; scored by whether the model's generated git patch passes the repository's actual unit tests. |
| **LiveCodeBench** | Competitive Coding | Continuously updated problems pulled from LeetCode, AtForces, and CodeForces *after* a model's training cutoff to prevent memorization. |
| **AIME / MATH-500** | Competition Math | Olympiad-qualifier algebra, number theory, and combinatorics problems requiring multi-step symbolic reasoning. |
| **Humanity's Last Exam** | Frontier Reasoning | Multi-disciplinary, expert-curated questions designed to resist shortcut pattern matching. |
| **Chatbot Arena (LMSYS)** | Human Preference | Crowdsourced blind A/B testing converted into a **Bradley-Terry Elo score**—the gold standard for real-world vibe and instruction following. |

---

## Who builds what: the major labs and how their architectures differ

Just like game studios split between commercial and proprietary engines, the LLM ecosystem splits into **closed frontier APIs** (optimized for massive cloud clusters) and **open-weight models** (which you can download, inspect, quantize, and run locally via Ollama, vLLM, or SGLang).

| Lab / Creator | Flagship Families | Weights | Core Architecture | Signature Technical Bet |
|---|---|---|---|---|
| **OpenAI** | GPT-4o, GPT-4.5/5 series, o1 / o3 / o4-mini | Proprietary (plus select open-weight releases) | Sparse MoE + RL-trained test-time compute | Pioneered large-scale test-time reasoning (`o`-series) and native omni-modal (audio/vision/text) streaming |
| **Anthropic** | Claude 3.5 / 3.7 / 4 (Haiku, Sonnet, Opus) | Proprietary | Dense & Sparse Transformers with hybrid reasoning | Industry benchmark for agentic coding (SWE-bench), Constitutional AI, and creator of the **Model Context Protocol (MCP)** |
| **Google DeepMind** | Gemini 1.5 / 2.0 / 2.5 (Pro, Flash) & Gemma 2/3 | Proprietary (Gemini) / Open (Gemma) | Sparse MoE co-designed for Google TPUs | Native multimodality from pre-training day one + **1M to 2M+ token context** via Ring Attention |
| **Meta AI** | Llama 3.1 / 3.3 (8B–405B), Llama 4 (Scout, Maverick) | Open-Weight | Dense GQA (Llama 3) $\rightarrow$ Multimodal MoE (Llama 4) | Ignited the open-weight ecosystem; shifted from pure dense 405B to interleaved MoE with up to 10M context in Llama 4 |
| **DeepSeek** | DeepSeek-V3 (671B), DeepSeek-R1 | Open-Weight (MIT) | Fine-Grained MoE (37B active) + **MLA** | Invented Multi-Head Latent Attention, auxiliary-loss-free load balancing, native FP8 training, and open-source GRPO reasoning |
| **Alibaba Cloud** | Qwen 2.5 / Qwen 3, QwQ | Open-Weight (Apache 2.0) | Dense (0.5B–72B) & Fine-Grained MoE | Dominant open-weight workhorses across every size bracket; hybrid thinking/non-thinking modes in Qwen 3 |
| **Mistral AI** | Mistral Large, Mixtral, Codestral, Pixtral | Open & Commercial tiers | Sliding Window Attention, GQA, and Sparse MoE | High-efficiency European models optimized for enterprise deployment, low-latency code completion, and local edge hardware |

### Key architectural philosophies explained

1. **Meta's Dense-to-MoE Pivot (Llama 3 vs. Llama 4):** For Llama 3.1 (up to 405B parameters), Meta famously avoided Mixture-of-Experts to maximize training stability on 16,384 H100 GPUs using 4D parallelism (Tensor, Pipeline, Context, and Data Parallelism). However, serving a 405B dense model requires reading 405B weights for every single token. With **Llama 4** (*Scout* and *Maverick*), Meta switched to a natively multimodal Mixture-of-Experts architecture using **iRoPE** (interleaved attention layers without positional embeddings plus temperature scaling) to push context lengths into the millions while keeping active parameters low.
2. **DeepSeek's Hardware-Co-Designed Efficiency:** Operating under hardware constraints, DeepSeek re-engineered the Transformer from first principles in **DeepSeek-V3** and **R1**. Beyond **MLA** (which cuts KV cache by ~90%) and **256 fine-grained experts**, they introduced **Multi-Token Prediction (MTP)** (predicting the next 2 tokens simultaneously to densify training signals and speed up speculative decoding) and wrote custom PTX GPU instructions to overlap inter-node InfiniBand communication completely behind computation.
3. **Google's Long-Context & TPU Stack (Gemini & Gemma):** Because Google trains and serves on custom **TPU v5p and Trillium** pods connected via optical circuit switches in 3D torus topologies, Gemini models are built around **Ring Attention** (splitting million-token sequences across chips in a ring so KV blocks circulate while compute happens simultaneously). Their open-weight **Gemma 2 and 3** models bring tricks like **interleaved local sliding-window and global attention** (alternating 5 local layers of 1024–4096 tokens with 1 global layer) and logit soft-capping down to laptops.
4. **Beyond Pure Transformers: State Space Models (Mamba) & Hybrids:** Because Transformer attention scales quadratically $O(N^2)$ during prefill and requires a growing KV cache during decode, researchers built **Selective State Space Models (Mamba / Mamba-2)** and **Linear Attention** variants (like Gated DeltaNet). These compress the entire past context into a fixed-size recurrent state, giving $O(1)$ memory per token and linear $O(N)$ scaling. Pure SSMs struggle with exact "needle-in-a-haystack" copy-paste recall, so the industry converged on **Hybrid Architectures** (like AI21's Jamba, NVIDIA's Nemotron-H, and hybrid Qwen/Mistral variants) that interleave 7 Mamba/Linear layers with 1 full-attention layer—getting constant-memory speed *and* exact recall.

---

## Which model or architecture fits which problem?

If you are building with LLMs or running them on your own hardware, here is how to match the architecture to the job:

| If you are building... | What to use & why |
|---|---|
| **Complex multi-step coding, math, or architecture planning** | **Reasoning / RLVR models** (Claude Sonnet/Opus with extended thinking, OpenAI o3/o4-mini, DeepSeek-R1, Qwen3-Thinking). Pay the TTFT latency cost to let test-time compute verify logic. |
| **Low-latency UI features, autocomplete, or voice agents** | **Small Dense or Flash-tier MoEs** (Gemini Flash, Claude Haiku, Qwen 2.5/3 7B–14B) combined with **Speculative Decoding** for high TPOT/tokens-per-second. |
| **Massive repository or multi-document analysis without RAG** | **Ring-Attention / Interleaved Local-Global models** (Gemini Pro/Flash 1M–2M context, Llama 4 Scout) where prefill cache sharing (Context Caching) cuts repeated prompt costs by 75%+. |
| **Local execution on a consumer laptop GPU (8 GB–16 GB VRAM)** | **4-bit quantized (Q4_K_M / AWQ) Dense 7B–14B or Small MoE models** (Qwen 2.5/3Coder, Llama 3.1 8B, Gemma 3, DeepSeek-R1-Distill) via Ollama or llama.cpp. |
| **High-throughput production self-hosting on cloud GPUs** | **Sparse MoE with GQA or MLA** served on **vLLM** or **SGLang** using **PagedAttention** (which manages KV cache like OS virtual memory pages to eliminate fragmentation) and **FP8 quantization**. |

The takeaway mirrors every other layer of systems engineering: there is no magic inside an LLM. It is matrix multiplication, clever KV cache compression, and reinforcement learning scaled up to the limits of memory bandwidth. Understand the data path from BPE token to SwiGLU expert, and you can predict exactly where any model will shine—and where it will bottleneck.

---

### Keep exploring

* Andrej Karpathy's [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI) and [Let's build the GPT Tokenizer](https://www.youtube.com/watch?v=zduSFxRajkE)
* [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) by Jay Alammar
* [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437) (for a masterclass in MLA, fine-grained MoE, and FP8 systems engineering)
* [LMSYS Chatbot Arena Leaderboard](https://lmarena.ai/) (for live Elo rankings across proprietary and open-weight models)
* [vLLM PagedAttention Paper](https://arxiv.org/abs/2309.06180) (how modern inference servers actually manage KV cache memory in production)