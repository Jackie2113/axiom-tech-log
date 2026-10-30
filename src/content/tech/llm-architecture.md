---
title: "Inside Large Language Models: From Tokens to Transformers and Beyond"
date: 2026-10-30
category: "AI & Systems"
maturity: "Production-Ready"
summary: "A practical tour of how modern LLMs turn tokens into answers, why attention and memory matter, how models are trained and served, and what today's public architecture reports actually tell us."
architectureImage: "/images/llm-transformer-stack.svg"
architectureCaption: "A simplified decoder-only Transformer: input tokens move through repeated attention and feed-forward blocks before the model scores the next token. Multimodal models add extra input pathways, while inference systems manage the KV cache and hardware."
youtubeId: "wjZofJX0v4M"
references:
  - title: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
  - title: "RoFormer: Enhanced Transformer with Rotary Position Embedding"
    url: "https://arxiv.org/abs/2104.09864"
  - title: "FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision"
    url: "https://arxiv.org/abs/2407.08608"
  - title: "The Llama 4 Herd of Models (Meta AI)"
    url: "https://ai.meta.com/blog/llama-4-multimodal-intelligence/"
  - title: "DeepSeek-V3 Technical Report"
    url: "https://arxiv.org/abs/2412.19437"
  - title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via RL"
    url: "https://arxiv.org/abs/2501.12948"
  - title: "Introducing DeepSeek-V4.1-Flash (DeepSeek)"
    url: "https://www.deepseek.com/en/news/deepseek-v4-1-flash/"
  - title: "Qwen3.8-Flash-Next: A New Architecture, Towards Ultimate Cost-Efficiency (Alibaba Cloud)"
    url: "https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towardsultimate-cost-efficiency_603501"
  - title: "Mistral Large 4 (Le Chonk) Is Now Open Weight (Mistral)"
    url: "https://mistral.ai/news/mistral-large-4-oss/"
  - title: "Alibaba's 2026 Qwen Roadmap"
    url: "https://www.alibabacloud.com/blog/alibaba-unveils-roadmap-on-full-stack-ai-strategy-from-chips-cloud-infrastructure-models-to-agents_603589"
  - title: "Gemini 4 Argon Model Card (Google DeepMind)"
    url: "https://deepmind.google/models/model-cards/gemini-4-argon/"
  - title: "Claude Model System Cards (Anthropic)"
    url: "https://www.anthropic.com/system-cards"
  - title: "OpenAI Deployment Safety Hub: System Cards"
    url: "https://deploymentsafety.openai.com/"
  - title: "Transformers are SSMs: Structured State Space Duality (Dao & Gu)"
    url: "https://proceedings.mlr.press/v235/dao24a.html"
---

*Updated October 30, 2026 · roughly a 16-minute read*

## Preface: the next-token engine

A modern AI assistant can search the web, analyse an image, write code and hold a surprisingly coherent conversation. Underneath all that, a language model is doing something more specific: it takes a sequence of tokens and estimates which token should come next.

That sounds almost too simple. But the model has learned its predictions from enormous collections of text, code and, increasingly, images, audio and video. To continue a sentence, solve a programming problem or follow a multi-step instruction, it has to build useful internal representations of language, context and patterns in the data.

The result is not a database of pre-written answers, nor a tiny person living inside a GPU. It is a large neural network whose learned parameters shape the probabilities it assigns to possible continuations. Repeat that process one token at a time and you get a response.

This article follows that process from the first token to the final answer. We'll look at the Transformer architecture, attention and its memory costs, how models are trained to follow instructions, what GPU metrics actually mean, and what the latest public model reports reveal about the major AI labs.

## The LLM pipeline, at a glance

The diagram below shows a common text-generation path: an input is converted into token IDs, embedded as vectors, processed by a stack of Transformer blocks, and turned into probabilities for the next token. The selected token is appended to the sequence and the process repeats.

It is a useful baseline, not a blueprint for every model. Some systems use encoder-decoder or hybrid architectures, and multimodal models add specialised pathways for images, audio and video before or alongside the language-model stack.

## What happens to a token?

### 1. Tokenization: turning text into IDs

A neural network does not read a sentence as letters on a screen. It receives numbers. A **tokenizer** splits the input into pieces—tokens—and maps each piece to an integer ID.

A token might be a whole word, part of a word, punctuation, whitespace or a byte-level fragment. Common approaches include **Byte-Pair Encoding (BPE)** and **Unigram** tokenization. Byte-level tokenizers can represent arbitrary text by starting from bytes and learning useful merges, but not every model uses the same tokenizer or vocabulary.

Why not just use one token per word? Because language is messy. Subword tokenization lets a model reuse familiar pieces across related words, names and technical terms. The trade-off is that different tokenizers split the same sentence differently, which affects context length, throughput and benchmark comparisons.

### 2. Embeddings: IDs become vectors

Each token ID selects a row from a learned **embedding matrix**. Instead of a number such as `1842`, the model now has a vector containing hundreds or thousands of values.

These vectors give the network a numerical space in which it can learn relationships between tokens and their contexts. The embedding is not a dictionary definition. Its meaning comes from how the vector is used and updated throughout training.

For text-only models, this is the usual starting point. A multimodal model may also turn image patches, audio segments or video frames into its own sequence of tokens or feature vectors, then connect them to the language model through a shared or adapted representation.

### 3. The Transformer block: attention plus a feed-forward network

Most widely used LLMs are based on the **Transformer**, introduced in the 2017 paper *Attention Is All You Need*. The original model used both an encoder and a decoder for machine translation. Many generative language models use a **decoder-only** design, while other systems use encoder-decoder or hybrid structures.

A decoder-only Transformer is built by stacking many similar blocks. Each block typically contains two main operations:

1. **Self-attention**, which lets each token gather information from earlier tokens in the sequence.
2. **A feed-forward network (FFN)**, which transforms each token's representation after attention has mixed contextual information into it.

Residual connections carry information around these operations, giving the network a stable path for information and gradients. Many modern models use a pre-normalization layout, often with **RMSNorm**, although this is a common design choice rather than a universal rule.

A simplified pre-norm block can be written as:

\[
 h' = h + \operatorname{Attention}(\operatorname{Norm}(h))
\]
\[
 h_{next} = h' + \operatorname{FFN}(\operatorname{Norm}(h'))
\]

The real implementation includes learned projections, biases or scaling choices, positional information and other details. But this gives us the main idea: attention mixes information between positions; the FFN processes the resulting representation at each position.

### 4. Position: how the model knows what came first

Attention by itself does not automatically know whether a token appeared at the start or the end of a sentence. The model needs some way to represent position and order.

One widely used method is **Rotary Position Embedding (RoPE)**. Rather than adding a positional vector once at the input, RoPE rotates pairs of dimensions in the query and key vectors by angles related to their positions. This makes attention scores sensitive to the relative positions of tokens.

RoPE is popular, but it is not the only option. Architectures may use learned position embeddings, relative-position biases, other positional schemes, or combinations of techniques. Some, such as Meta's Llama 4 design, interleave attention layers that use RoPE with layers that omit positional embeddings and apply a separate inference-time scaling technique.

Longer context windows also require more than simply turning one frequency knob. Techniques such as interpolation and YaRN-style scaling can help a model operate beyond its original training length, but a larger advertised context window does not guarantee perfect recall across every token in that window.

### 5. Self-attention: deciding what matters right now

In self-attention, the hidden representation at each position is projected into three vectors:

- **Query (Q):** what this position is looking for.
- **Key (K):** what information this position offers to other positions.
- **Value (V):** the information that can be passed along.

The attention operation compares queries with keys, turns those scores into weights using softmax, and uses the weights to combine the value vectors:

\[
\operatorname{Attention}(Q,K,V) = \operatorname{softmax}\left(\frac{QK^T}{\sqrt{d_k}} + M\right)V
\]

Here, \(d_k\) is the key dimension and \(M\) is a **causal mask**. The mask prevents a token from using information from future positions. Without it, a model trained to predict the next token could cheat by looking at the answer.

Attention is usually split into multiple heads. Each head can learn a different way of relating tokens, and their outputs are combined before the FFN.

### 6. The KV cache: remembering the prefix efficiently

Generating a response is an incremental process. Once the model has processed the prompt, it produces a token, adds it to the sequence and predicts the next one.

A naive implementation could recompute the keys and values for every earlier token each time a new token is generated. Instead, inference systems store those previously computed keys and values in GPU memory. This is the **key-value cache**, or **KV cache**.

The cache avoids repeating work, but it takes up memory. Its size grows with the number of layers, the sequence length, the batch size, the number of key/value heads and the precision used to store each value. Long prompts and many simultaneous users can therefore create substantial memory pressure.

This is one reason attention designs have evolved:

| Variant | How it works | Cache implication |
|---|---|---|
| **MHA — Multi-Head Attention** | Each query head has its own key and value head. | The reference design; largest cache among these options for comparable dimensions. |
| **MQA — Multi-Query Attention** | All query heads share one key head and one value head. | Very small cache, but sharing can reduce flexibility. |
| **GQA — Grouped-Query Attention** | Groups of query heads share a smaller set of key/value heads. | A practical compromise between MHA quality and MQA cache savings. |
| **MLA — Multi-Head Latent Attention** | Compresses key/value information into a smaller latent representation before caching. | Can reduce cache requirements substantially; the exact saving depends on the model's dimensions. |

These are not simply four generations where each new one replaces the previous one. They are design choices with different trade-offs. For example, Meta's Llama 3 family uses GQA, while DeepSeek-V2 and V3 use MLA. A model's actual cache footprint depends on its configuration, context length, batch size and cache precision—not just the name of its attention variant.

### 7. FlashAttention: less time moving data around

There is another memory problem inside attention. A straightforward implementation can create a large matrix of attention scores, then read and write that intermediate data to high-bandwidth GPU memory (HBM).

**FlashAttention** changes how the calculation is scheduled. It divides queries, keys and values into blocks, performs the work in smaller pieces using fast on-chip memory, and uses an online softmax calculation to combine the results. It computes exact attention (up to normal floating-point differences) while reducing expensive memory traffic.

This is an important distinction: FlashAttention improves the efficiency of the attention calculation; it does not, by itself, eliminate the KV cache or make long context free. FlashAttention-2 and FlashAttention-3 build on the same IO-aware idea with further improvements for modern GPUs.

<iframe width="100%" height="420" src="https://www.youtube-nocookie.com/embed/eMlx5fFNoYc" title="Attention in transformers, step by step — 3Blue1Brown" style="border:0; border-radius:12px;" loading="lazy" allowfullscreen></iframe>

*3Blue1Brown's visual explanation of how queries, keys and values interact. [Watch on YouTube](https://www.youtube.com/watch?v=eMlx5fFNoYc).*

### 8. The feed-forward network: dense layers and expert routing

After attention has mixed contextual information, the FFN transforms each token's representation. A common modern activation is **SwiGLU**, a gated variant of the feed-forward network. In simplified form:

\[
\operatorname{SwiGLU}(x) = (\operatorname{Swish}(xW_{gate}) \odot xW_{up})W_{down}
\]

The gate controls how strongly different features pass through the block. This is one of several FFN designs used in modern Transformers.

A standard **dense** FFN runs the same learned network for every token. A **Mixture-of-Experts (MoE)** layer instead contains several expert networks and a small router that selects which experts process each token. Only a subset of the experts is activated for a given token, even though the model stores the parameters for all of them.

That distinction creates two useful numbers:

- **Total parameters:** all the model weights stored across its experts and other layers.
- **Active parameters:** the subset used to process a particular token.

DeepSeek-V3 is a well-documented example: its report describes 671 billion total parameters, with 37 billion activated per token. That does not mean it is equivalent to a dense 37B model; it still has a much larger total set of learned parameters, and serving it involves routing and distributing expert weights across hardware.

MoE can increase model capacity without running every expert for every token. The trade-off is more complex routing, memory placement and communication between GPUs. Sparse does not automatically mean simple or cheap to serve.

## Training: from text completion to useful behaviour

The architecture is only part of the story. A model's behaviour depends heavily on how it is trained and post-trained. A simplified pipeline looks like this, although the exact recipe varies by lab and model family.

### 1. Pre-training: learn to continue

During pre-training, the model sees large sequences of tokens and learns to predict the next token. The training objective is commonly a form of **cross-entropy loss**: the model is penalised when it assigns low probability to the token that actually comes next.

The data can include web pages, books, code, mathematics, licensed material and synthetic examples. The mix, filtering, deduplication and training schedule matter enormously, and most labs do not disclose every detail.

Pre-training gives a model broad pattern knowledge. It does not automatically make it a helpful assistant. A base model may continue a document convincingly without understanding that a user expects a direct answer.

### 2. Supervised fine-tuning: learn the task

**Supervised Fine-Tuning (SFT)** trains the model on examples of prompts paired with desirable responses. These examples teach it how to answer questions, follow instructions, format output, refuse certain requests and use tools in the expected format.

The distinction is simple: pre-training teaches the model to continue patterns; instruction tuning teaches it which kinds of continuation are useful in an assistant setting.

### 3. Preference training: shape the answers

A model can produce several plausible responses, but not all are equally helpful. Preference training uses comparisons or rankings to encourage better behaviour.

Two familiar approaches are:

- **RLHF:** human preferences are used to train a reward model, and reinforcement learning—often a method such as PPO—is used to optimise the language model against that reward, with constraints to limit unwanted drift.
- **DPO:** Direct Preference Optimization uses preferred and rejected response pairs to update the model directly, without requiring the same separate reward-model-plus-RL pipeline.

Neither label describes every detail of a modern training recipe. Labs often combine supervised data, preference data, reward models and several optimisation methods.

### 4. Verifiable rewards and reasoning at inference time

For tasks such as mathematics and programming, some answers can be checked automatically. A compiler can reject invalid code; unit tests can check a patch; a symbolic solver can verify a mathematical result. Training methods that use these checks are often grouped under **Reinforcement Learning with Verifiable Rewards (RLVR)**.

DeepSeek-R1 is a prominent published example of reasoning-oriented reinforcement learning, including the use of **Group Relative Policy Optimization (GRPO)**. The broad idea is to generate candidate solutions, compare their outcomes against a verifiable reward and use that signal to improve the model.

There is also **test-time compute**: spending more computation while answering, for example by allowing a model to explore intermediate steps, call tools, verify a result or revise an attempt. This can improve performance on difficult tasks, but it increases latency and cost. More tokens or more reasoning time are not a guarantee of a correct answer.

<iframe width="100%" height="420" src="https://www.youtube-nocookie.com/embed/kCc8FmEb1nY" title="Let's build GPT from scratch — Andrej Karpathy" style="border:0; border-radius:12px;" loading="lazy" allowfullscreen></iframe>

*Andrej Karpathy builds a small GPT in code, making the relationship between training, attention and generation concrete. [Watch on YouTube](https://www.youtube.com/watch?v=kCc8FmEb1nY).*

## Inference: speed, memory and the cost of a token

Training is where a model learns its weights. **Inference** is what happens when those weights are used to answer a request. At this stage, the model's architecture meets the realities of GPUs, memory and serving software.

### Prefill versus decode

An inference request is often described in two phases:

- **Prefill:** the model processes the prompt. Many input tokens can be handled in parallel, so this phase often places substantial demand on matrix-multiplication throughput.
- **Decode:** the model generates new tokens one at a time. Each step uses the model weights and the cached context to produce the next token. For small batches, this phase is often limited by moving weights and KV-cache data through memory rather than by peak arithmetic throughput alone.

This is why a GPU with impressive theoretical FLOPs does not automatically produce the fastest text generation. Memory bandwidth, cache size, batch size, interconnect speed, kernel efficiency and serving strategy all matter. With larger batches, the bottleneck can shift.

### Metrics worth knowing

| Metric | What it measures | Why it matters |
|---|---|---|
| **TTFT — Time to First Token** | Time from request submission to the first generated token. | Captures prompt processing, queueing and network overhead; especially noticeable in chat and voice interfaces. |
| **TPOT — Time Per Output Token** | Average delay between generated output tokens. | Affects how quickly a response appears once generation has started. |
| **Tokens per second** | Output generation rate, usually reported per request or across a server. | Useful for comparing speed, but the batch size and measurement setup must be stated. |
| **KV-cache footprint** | Memory used to store attention keys and values for the active context. | Limits context length and the number of concurrent sequences that fit in memory. |
| **MFU — Model FLOPs Utilization** | Achieved model computation relative to the hardware's theoretical peak. | Helps assess how efficiently a training run uses its accelerator cluster. |

A rough KV-cache estimate for a conventional attention layer is:

\[
\text{Bytes} \approx 2 \times L \times B \times T \times H_{KV} \times D_H \times S
\]

where \(L\) is the number of layers, \(B\) the batch size, \(T\) the cached sequence length, \(H_{KV}\) the number of key/value heads, \(D_H\) the head dimension, and \(S\) the bytes per stored value. The factor of two accounts for keys and values. MLA and other compressed-cache designs need a different model-specific calculation.

### Quantization: smaller weights, different trade-offs

A model's weights do not always need to be stored in their original precision. **Quantization** represents them using fewer bits, reducing memory use and often improving throughput. The trade-off is that lower precision can affect quality, and the actual result depends on the quantization method and model.

| Weight format | Approx. storage per parameter | Raw weight storage for 70B parameters |
|---|---:|---:|
| **FP16 / BF16** | 2 bytes | 140 GB |
| **FP8** | 1 byte | 70 GB |
| **4-bit** | 0.5 bytes | 35 GB |

These are decimal, weights-only estimates. Real deployments need extra room for quantization scales, metadata, activations, temporary buffers and the KV cache. A model advertised as “70B at 4-bit” therefore needs more than the raw 35 GB figure to run comfortably.

## How do we measure whether a model is good?

Model capability is not one number. A model can be excellent at coding and mediocre at factual recall, or score well on a knowledge test while struggling to operate a real software tool. Benchmarks are useful, but each measures a slice of behaviour under a particular setup.

| Benchmark | What it looks at | What to keep in mind |
|---|---|---|
| **Perplexity (PPL)** | How well a model predicts a held-out text corpus. | Lower is better on the same evaluation setup; tokenizer differences make direct comparisons difficult. |
| **GPQA Diamond** | Graduate-level science questions in biology, chemistry and physics. | A compact, difficult multiple-choice test—not a measure of all scientific reasoning. |
| **SWE-bench Verified** | Whether an agent can resolve real GitHub issues and pass the associated tests. | Scores depend on the agent scaffold, tools, model settings and evaluation environment, not just the base model. |
| **LiveCodeBench** | Coding problems collected over time, including newer tasks. | Useful for reducing contamination from old public problems; still reflects a particular coding format. |
| **AIME / MATH** | Competition-style mathematics. | Tests multi-step mathematical problem solving, but does not cover every form of reasoning. |
| **Humanity's Last Exam** | Broad, difficult questions across specialist domains. | Designed to be challenging; its results should be read alongside methodology and tool-use conditions. |
| **Chatbot Arena** | Human preference in blind side-by-side comparisons. | Measures which answer people prefer, not necessarily factual accuracy or task completion. |

A benchmark score is a measurement, not a personality test for a model. Always check the date, prompt format, number of attempts, tool access, model version and whether the score was produced by the model alone or by a larger agent system.

## What are the major labs building?

This is where it is important to separate **what is published** from what people infer. Some labs release detailed technical reports and downloadable weights. Others publish system cards describing capabilities, training approaches and safety evaluations without disclosing the full layer-by-layer architecture. A confident-looking table of secret model internals is still guesswork if the lab has not published those details.

The following is a snapshot of representative, publicly described designs as of October 30, 2026. It is not a ranking, and it is not a complete inventory of every model a lab offers.

| Lab / family | What public material tells us | Availability and caveat |
|---|---|---|
| **OpenAI — GPT-6 family** | Public system cards discuss training approaches, modalities, capabilities and safety evaluations. | Proprietary models. The published cards are not full architecture specifications, so exact layer counts or dense/MoE configuration should not be guessed. |
| **Anthropic — Claude 5.x** | Model system cards document capabilities, evaluations and deployment safeguards. | Proprietary models. Public cards provide useful transparency, but not a complete architectural blueprint. |
| **Google DeepMind — Gemini 4 Argon** | Its model card describes a Transformer-based, sparse Mixture-of-Experts model with native text, vision and audio support. | Proprietary. Google publishes a model card, but not downloadable model weights or every implementation detail. |
| **Meta — Llama 4 Scout and Maverick** | Meta describes natively multimodal MoE models and its iRoPE approach, which interleaves attention layers with and without RoPE. | Downloadable weights, subject to Meta's licence. “Open-weight” is more precise than calling the release fully open source. |
| **DeepSeek — V3 and V4.1-Flash** | V3 combines MoE with Multi-Head Latent Attention. DeepSeek's September 2026 V4.1-Flash announcement describes a 552B-parameter MoE using an asymmetric causal encoder-decoder design, with 8B active parameters on input and 16B on output. | Public reports make parts of this family relatively inspectable. The V4.1-Flash figures are vendor-reported specifications, not an independent benchmark. |
| **Alibaba — Qwen3.8 / Qwen4 roadmap** | Qwen3.8-Flash-Next is a multimodal MoE hybrid: three of every four layers use Gated DeltaNet, with Qwen Sparse Attention in the remaining layer. It also adds gated residuals and n-gram embeddings. Alibaba describes it as an early preview of the architecture intended for Qwen4. | Qwen3.8-Flash-Next has downloadable weights. Alibaba said Qwen4 was still in training in its September 2026 roadmap update; an announced roadmap is not a released model. |
| **Mistral — Large 4 (Le Chonk)** | Mistral describes a natively multimodal, hybrid instruction-and-reasoning MoE with about 1T total parameters and 52B active parameters. | Weights were released on October 29, 2026 under Mistral's open-weight licence. Mistral said a fuller technical report was still to come, so the public architecture description remains high-level. |

A few examples make the differences clearer:

- **DeepSeek-V3** is a useful case study in MoE and cache optimisation. Its published report gives unusually concrete details, including total and active parameter counts, MLA and expert routing.
- **Llama 4** shows how a model family can combine multimodal training, MoE and a particular positional strategy. Its iRoPE description is specific to that design, not a new rule that every Transformer follows.
- **Qwen3.8-Flash-Next** is an example of a hybrid approach: it combines recurrent-style Gated DeltaNet layers with sparse attention, aiming to compress long histories while retaining a route for more precise retrieval.
- **Mistral Large 4** illustrates the scale of recent open-weight MoE models, while also showing why it is worth distinguishing an announcement from a full technical report.
- **Gemini 4 Argon** is a reminder that some frontier architecture details are now published in model cards, even when the model itself remains proprietary.

## Beyond the standard Transformer

Transformers remain central to modern LLMs, but they are not the only way to process sequences.

**State-space models (SSMs)** such as Mamba use a recurrent state that is updated as the sequence is processed. This can avoid keeping a conventional attention KV entry for every previous token, which is attractive for long sequences and streaming workloads. Mamba-2's research connects state-space models and attention more closely than the names might suggest.

There are also **linear-attention** methods and hybrid designs that mix attention with state-space or other sequence-processing layers. They aim to balance the strengths of each approach: attention's flexible access to earlier tokens and alternative sequence models' potentially more favourable scaling or memory behaviour.

None is a free upgrade. A compact recurrent state can be efficient, but it may not preserve every detail of a long context as precisely as full attention. Hybrid designs try to balance those trade-offs rather than declare one family the winner.

## Choosing a model or architecture for a job

There is no universal “best” model. Start with the workload and constraints, then choose the architecture and serving setup that fit.

| Your priority | What to investigate | Why |
|---|---|---|
| **Complex maths, coding or multi-step analysis** | Reasoning-oriented models, verifiable rewards and tool-use support. | Extra inference-time computation can help on hard tasks, but increases latency and cost. |
| **Fast responses for autocomplete or chat** | Smaller dense models, compact MoE models and efficient decode kernels. | A lower time-per-token can matter more than a model's peak benchmark score. |
| **Very long documents or histories** | Long-context support, cache efficiency and retrieval quality. | A huge context window is useful only if the model can reliably use the information inside it. |
| **Local or private deployment** | Downloadable weights, quantization support and the memory needs of the full runtime. | Parameter count alone does not tell you whether a model will fit or run well on your machine. |
| **High-throughput serving** | MoE routing, GQA/MLA-style cache designs, batching and inference servers such as vLLM or SGLang. | Good serving performance depends on the whole stack, not just the model architecture. |
| **Images, audio or video** | Native multimodal input support and the model's actual modality-specific limits. | A text-only model with an added wrapper is not necessarily equivalent to one trained for multimodal input. |

The architecture matters, but so do the tokenizer, training data, post-training, inference engine, quantization, hardware and evaluation setup. Comparing model names alone misses most of the engineering.

## The takeaway

An LLM is not magic, but it is not “just autocomplete” in the dismissive sense either. It is a large learned system built from token representations, attention or other sequence-processing layers, feed-forward computation, and a training process that shapes how those parts behave.

The practical limits often show up in less glamorous places: memory bandwidth, cache size, communication between GPUs, prompt length, serving queues and the cost of generating more tokens. Understanding those constraints makes it easier to judge why one architecture is fast, another is expensive, and a third works better for a particular task.

Once you understand the journey from token ID to output probability, the headline terms—GQA, MLA, MoE, RoPE, quantization and test-time compute—stop being a wall of acronyms. They become different engineering answers to the same question: **how do we make a model more capable without making it impossibly expensive to train and run?**

---

### Keep exploring

- 3Blue1Brown: [Transformers, the tech behind LLMs](https://www.youtube.com/watch?v=wjZofJX0v4M) and [Attention in transformers, step by step](https://www.youtube.com/watch?v=eMlx5fFNoYc)
- Andrej Karpathy: [Let's build GPT from scratch, in code](https://www.youtube.com/watch?v=kCc8FmEb1nY) and [Let's build the GPT Tokenizer](https://www.youtube.com/watch?v=zduSFxRajkE)
- Jay Alammar: [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- DeepSeek: [V3 Technical Report](https://arxiv.org/abs/2412.19437) and [V4.1-Flash announcement](https://www.deepseek.com/en/news/deepseek-v4-1-flash/)
- [vLLM PagedAttention paper](https://arxiv.org/abs/2309.06180) for a deeper look at KV-cache management in serving systems
