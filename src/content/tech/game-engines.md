---
title: "Game Engines: The Hidden Machinery Behind Every Game"
date: 2026-10-30
category: "Game Development"
maturity: "Production-Ready"
summary: "What a game engine is, where it came from, what it can do, and how Unreal, Unity, Godot and the big studios' in-house engines compare as of late 2026."
architectureImage: "/images/game-engine-architecture.svg"
architectureCaption: "A simplified game engine stack: game content on top, scripting and gameplay below it, engine systems in the middle, and platform APIs at the bottom, with the editor and tools touching every layer."
youtubeId: "xXGSvLH9zAs"
references:
  - title: "State of Unreal 2026: Top news from the show (Epic Games)"
    url: "https://www.unrealengine.com/news/state-of-unreal-2026-top-news-from-the-show"
  - title: "Unreal Engine 6 will combine UE5 and UEFN into a unified engine (GamesBeat)"
    url: "https://gamesbeat.com/unreal-engine-6-will-combine-ue5-and-uefn-into-a-unified-engine-state-of-unreal/"
  - title: "Unity 6.6 is now available (Unity Discussions)"
    url: "https://discussions.unity.com/t/unity-6-6-is-now-available/1735357"
  - title: "Unity Engine 7: Changing the Development Paradigm and the Roadmap Ahead (Inven Global)"
    url: "https://www.invenglobal.com/articles/24003/unity-engine-7-changing-the-development-paradigm-and-the-roadmap-ahead"
  - title: "Game Engines and Game History (Henry Lowood, Kinephanos)"
    url: "https://www.kinephanos.ca/2014/game-engines-and-game-history/"
  - title: "Unity (game engine), history and releases (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Unity_(game_engine)"
  - title: "Breaking new ground: How Battlefield 6 reimagines destruction (EA)"
    url: "https://www.ea.com/en/news/how-battlefield-6-redefined-destruction"
  - title: "Capcom Says REX Will Evolve RE ENGINE Step by Step (Digital Citizen)"
    url: "https://www.digitalcitizen.life/capcom-rex-re-engine-evolution-plan/"
  - title: "Digital Foundry's first look at id Tech 8 (via Wccftech)"
    url: "https://wccftech.com/doom-the-dark-ages-id-tech-8-ray-tracing-vitualized-geometry/"
  - title: "Guerrilla Games: Decima posts"
    url: "https://www.guerrilla-games.com/tags/decima"
  - title: "Godot 4.7 released (Playing Tux)"
    url: "https://playingtux.com/en/articles/2026/06/godot-47-released/"
---

*Updated October 30, 2026 · roughly a 20-minute read*

## Preface: the part of the game you never see

Pick any game you love and think about what you actually remember. The characters, the music, the moment a bridge collapses under a tank, the way light falls through a dusty window. Now ask a stranger question: who is responsible for the fact that any of it appears on your screen sixty times a second, reacts to your thumbs, and doesn't fall apart when you do something unexpected?

Most of the time the answer is a **game engine**, and almost nobody outside the industry ever sees it.

An engine is the invisible machinery underneath a game. It draws the pixels, simulates the physics, plays the audio, loads the world in time, talks to the network, and gives the people building the game a place to do all of it without rewriting the basics every time. It is the reason a small team can now ship something that would have needed a hundred programmers in 1995.

This piece is the long version of that idea. We'll start with what an engine really is, trace how the concept was invented, look at what modern engines can do, and then get to the part everyone argues about: **Unreal Engine, Unity, Godot, and the proprietary in-house engines** that studios like EA, Capcom, id Software, Guerrilla and Valve keep building for themselves.

It is also a good moment to write it. As of late October 2026, the engine landscape is moving at a pace we haven't seen in years: Unreal Engine 6 has been announced, Unity 7 is heading into beta, Capcom is evolving its engine into something new, and several famous studios have switched sides. Everything below is accurate as of today, and I've flagged the places where plans are still just plans.

## What is a game engine, really?

A game engine is a reusable software foundation for building games. Think of it as a toolbox and a runtime in one: a set of ready-made systems for the things *every* game needs, plus an editor where people assemble levels, characters and rules out of art and code.

One of the people who coined the idea explained it with a car analogy, and it still works: the engine is the heart of the car, while the art, levels and sounds are the body and paint. Swap the body and you have a different car on the same heart. That separation of engine from content is the whole trick, and we'll see in a moment why it was such a big deal.

The diagram at the top of this page shows the usual layout. A rough map of what lives inside, from top to bottom:

* **Your game.** Levels, characters, rules, UI and art. This is the part players actually experience.
* **Gameplay layer and scripting.** Where designers and programmers describe what happens: *when the player touches the key, open the door.* Depending on the engine this might be Unreal's Blueprints and C++, Unity's C#, Godot's GDScript, or Epic's newer language Verse.
* **Engine systems.** Rendering, physics, animation, audio, AI and navigation, networking, UI, and world streaming. These are the big, expensive, hard-to-get-right subsystems.
* **Core.** The unglamorous plumbing: how the scene is represented, how assets are loaded and processed, how work is split across CPU cores, how memory is managed.
* **Platform layer.** The bridge to graphics APIs such as DirectX, Vulkan and Metal, to consoles, operating systems, controllers and storage.
* **Editor and tools.** Everything people use to build the game: scene editors, material graphs, animation tools, profilers, build pipelines, version control.

The reason this matters is economic as much as technical. Rendering a believable forest, simulating a collapsing wall, or keeping a hundred players in sync online are each problems that can consume years of specialist work. An engine lets a studio spend that effort once, or lets them rent it, and put their own creativity into the game.

> An engine is a bet that a hundred games will need the same hard thing, so someone should only have to solve it once.

## How we got here: a short history

### Before engines, every game was a one-off

In the early days of arcades, consoles and home computers, a game was usually written from scratch for one title, often by one or two people, and the code was tuned to the specific hardware. The idea of a reusable "engine" as a category of software simply didn't exist yet. Historians of the field point out that the phrase wasn't in common use around the time the Intellivision launched in 1979.

### id Software and the birth of the idea

The breakthrough came from a small team that was trying to ship games quickly. In 1990, John Carmack and John Romero, then at the company Softdisk, decided that DOS PCs were the future of games. Carmack had worked out smooth horizontal scrolling on the PC, and that experiment led them to leave and form id Software.

Their *Commander Keen* games in 1990 and 1991 shared a single codebase, which the team began calling the "Keen engine." It was a pragmatic move: they were under brutal schedules and reuse was the only way to keep up. In the summer of 1991, id even held a seminar offering the engine to outside developers. Only one company took them up on it, Apogee, which made *Biomenace* with it and later built its own version once it had the source code.

Then came **Doom** in late 1993, and with it the decision that changed the industry: Carmack cleanly separated the engine from the *content* it ran, meaning maps, graphics and demo files lived in their own data files. The phrase "Doom engine" appeared in id's own press material, and within a year the term was showing up in books, magazines and the first issue of *Game Developer*.

That separation had two enormous consequences. Studios realised the engine itself was a product they could license. And players realised they could change the content without touching the engine, which gave birth to modding culture. When **Quake** arrived in 1996, the community was already building custom levels, total conversions and even player-made films that later grew into the machinima scene.

You can still see the family tree. Valve's engine lineage runs from id Tech 2 (the Quake engine) through GoldSrc and Source to today's Source 2.

### The licensing era

Through the late 1990s and 2000s, the engine became a business. Epic Games' **Unreal Engine** debuted in 1998 with the original *Unreal*, followed by Unreal Engine 2 in 2001 and Unreal Engine 3 in 2006. Studios increasingly chose to license an engine instead of building one, and the engine makers competed on how much of the pipeline they could hand over.

In June 2005 a different philosophy appeared. **Unity** 1.0 was shown at Apple's Worldwide Developers Conference and launched for Mac OS X first. It aimed at ease of use and approachability, and when Apple opened its App Store in 2008 and Unity added iPhone support, it was perfectly placed for the mobile gold rush. A Windows editor followed with Unity 2.5 in 2009.

### The 2015 democratisation

A single week in March 2015 captures the shift. Unreal Engine 4 went free to download. Unity 5 launched with a free personal tier and WebGL support so games could run in browsers without plug-ins. And Valve announced Source 2, free to content creators. Engines that once cost serious money were suddenly available to students, hobbyists and tiny teams, and the number of people making games exploded.

### The modern era

**Unreal Engine 5** was revealed in May 2020 and released in April 2022. Its headline feature was **Nanite**, a virtualized geometry system that lets artists use enormously detailed models without hand-crafting layers of lower-detail versions. Epic used its own game, *Fortnite*, as a testbed and moved it to Unreal Engine 5 in December 2021.

In October 2024, Unity launched **Unity 6**, bringing a new generation of tools and generative-AI features to the editor. Meanwhile, the open-source **Godot** engine kept growing steadily, and many large studios continued to maintain their own engines. We'll get to every one of those.

| Year | Milestone |
|---|---|
| 1990 to 1991 | id Software builds the "Keen engine" and tries to license it |
| 1993 | *Doom* separates engine from content; the "Doom engine" name enters the vocabulary |
| 1996 | *Quake* supercharges modding and spawns machinima |
| 1998 | Unreal Engine 1 ships with *Unreal* |
| 2005 | Unity 1.0 debuts at Apple's WWDC |
| 2008 | Frostbite debuts with *Battlefield: Bad Company*; Unity adds iPhone support |
| 2014 to 2015 | Unreal Engine 4 arrives and goes free; Unity 5 and Source 2 follow |
| 2017 | Capcom's RE Engine debuts with *Resident Evil 7* |
| 2022 | Unreal Engine 5 is released |
| 2024 | Unity 6 launches; Halo's studio announces a move to Unreal |
| 2025 | id Tech 8 debuts with *Doom: The Dark Ages* |
| 2026 | Unreal Engine 6 announced; Unity 7 revealed; Capcom reveals its REX plan |

## What a modern engine can actually do

It's easy to say "an engine handles graphics and physics." The interesting part is how much more it does now, and how quickly the baseline has risen.

**Rendering that behaves like light.** Modern engines simulate how light bounces through a scene instead of faking it with pre-baked textures. Unreal's Lumen provides dynamic global illumination, so moving a light or opening a door changes the whole room's lighting in real time. Ray-traced reflections and global illumination are no longer exotic; id Software's newest engine goes so far as to require ray-tracing-capable hardware.

**Geometry without limits.** Virtualized geometry systems stream only the detail you can actually see, so a rock can be a film-quality scan and still run smoothly. Engines also handle huge open worlds by loading and unloading regions seamlessly as you move.

**Simulation.** Physics engines handle rigid bodies, cloth, destruction and vehicles. Unreal 5.8 promoted Dataflow for Chaos Cloth to Production Ready, and in Battlefield 6 the destruction system is arguably the star of the show, with buildings that break apart in pieces and networking that keeps every player seeing the same rubble.

**Animation and characters.** From skeletal animation to motion capture to digital humans. Unreal 5.8 adds a MetaHuman Devkit and a markerless motion-capture plugin for turning ordinary video into animation.

**Audio, networking and world building.** Spatial sound with debugging tools like Unreal's Audio Insights, replication systems such as Iris for multiplayer, and procedural tools for scattering vegetation and buildings across a map without placing each by hand.

**An iteration machine.** Increasingly the headline feature isn't a graphics trick, it's *speed of iteration*. Shorter compile times, faster editors, and partial reloads so you can test a change in seconds instead of minutes. This is the entire pitch for Unity's CoreCLR move, which we'll discuss below.

**AI-assisted workflows.** This one is brand new. Unreal 5.8 includes an experimental plugin built on the Model Context Protocol (MCP) that lets AI models work inside a project, creating assets, running tests and tuning performance. Unity 7 is being built to let developers and coding agents collaborate in the same project, and Capcom has said it plans to fold AI generation into its engine over time. Whether you love or loathe that direction, it is now part of the engine conversation.

Two demos made the leap in capability feel tangible. The first is Epic's reveal of Unreal Engine 5, which showed film-scale geometry and dynamic lighting running live on a PlayStation 5:

<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/qC5KtatMcUw" title="Unreal Engine 5 Revealed - Next-Gen Real-Time Demo Running on PlayStation 5" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy" allowfullscreen></iframe></div>

*Unreal Engine 5 Revealed, the 2020 real-time demo that introduced Nanite and Lumen. [Watch on YouTube](https://www.youtube.com/watch?v=qC5KtatMcUw).*

The second is *The Matrix Awakens*, released in December 2021 as a free experience on PlayStation 5 and Xbox Series X/S. It combined a crowded, drivable city with film-grade characters and was widely used as a benchmark for what the new generation could do. Epic said at the time there was no dedicated PC version planned, though it later released the content as a sample project.

<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/ON4PFiPidOo" title="The Matrix Awakens: An Unreal Engine 5 Experience - Official Teaser Trailer" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy" allowfullscreen></iframe></div>

*The Matrix Awakens: An Unreal Engine 5 Experience, official teaser (IGN). [Watch on YouTube](https://www.youtube.com/watch?v=ON4PFiPidOo).*

## Build or buy? The real engine decision

Every studio eventually faces the same question: use an existing engine, or build your own?

**Using a commercial engine** (Unreal, Unity, Godot) means you get a tested toolset, a large hiring pool of people who already know it, documentation, marketplace content and a big community. The trade-offs are that you inherit the engine's assumptions, you depend on another company's roadmap, and licensing terms can change.

**Building in-house** gives you total control and an engine shaped around exactly your kind of game, with engineers sitting next to designers. The trade-off is cost: maintaining an engine is a permanent, expensive commitment, and hiring someone who already knows your proprietary tools is impossible.

There is no universally right answer, which is why the most interesting story of 2026 is who is moving which way. We'll look at the evidence in the in-house section.

## Unreal Engine: the high-end generalist

**Epic Games' Unreal Engine** is the best-known engine for large, visually ambitious games, and it has also spread into film and television production, architecture and real-time visualization. It's best known for cutting-edge rendering out of the box and a deep toolset.

### Where it is today: Unreal Engine 5.8

Unreal Engine 5.8 shipped on June 17, 2026, at the State of Unreal keynote in Chicago. Its headline themes are performance and maturity:

* **MegaLights, Audio Insights, Dataflow for Chaos Cloth, Live Link Hub, Iris and Movie Render Graph** all reached Production Ready status.
* **Lumen** gains a lightweight dynamic global illumination mode designed to hit 60 FPS on Nintendo Switch 2 and PC.
* **Shader compilation and pre-caching improvements** cut *Fortnite's* shader count by 68%, which matters because shader compilation hitches are a long-running complaint about modern PC games.
* **Mesh Terrain** (experimental) lets artists build landscapes that aren't constrained by heightfields.
* **Character tools** include the Zebra sample, a MetaHuman Devkit and a markerless motion capture plugin.
* **An experimental MCP plugin** lets AI models operate inside a project.
* **Lore**, Epic's version control system for large, asset-heavy projects, was open-sourced.

Epic called 5.8 the last planned major UE5 release, though it left the door open to a 5.9.

### Where it's going: Unreal Engine 6

Epic first teased Unreal Engine 6 in May 2026 around a Rocket League esports event, and Rocket League is the first announced game to move to it, replacing its old Unreal Engine 3 foundation. At State of Unreal the company laid out the plan. The core idea is a merger: **UE5 plus Unreal Editor for Fortnite (UEFN) equals UE6.**

Today there are essentially two ways to build with Epic's technology: the full engine for standalone games on stores, and UEFN for content that lives inside Fortnite. Epic's vision is that if you build something once "the Unreal Engine 6 way," you can ship it to console and PC stores, mobile stores, and into Fortnite or any other UE6-based ecosystem.

The technical foundations include:

* **Verse**, Epic's programming language, becoming the basis of the future programming model.
* **Scene Graph**, a new gameplay framework built from scratch on Verse.
* **Transactional execution**, where Verse functions run as atomic transactions that can be rolled back and re-simulated, with Epic aiming to distribute single-threaded-style game code across many servers automatically.
* **MCP integrations** so developers can bring their preferred AI models into the pipeline.
* **Open standards** so content, code and economies can move between games and engines.

The timeline matters: Epic is targeting **Early Access at the end of 2027**, with the full release planned 12 to 18 months after that. Press coverage also reported that Blueprints, Unreal's beloved visual scripting system, is slated for eventual deprecation; Epic said a clear timeline would be shared later, so treat that as unsettled.

<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/Ukcgwy7tUE8" title="Unreal Engine 6 - Reveal Overview | State of Unreal 2026" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy" allowfullscreen></iframe></div>

*Unreal Engine 6 reveal overview from State of Unreal 2026 (IGN). The full official keynote is the video at the top of this page. [Watch on YouTube](https://www.youtube.com/watch?v=Ukcgwy7tUE8).*

### Strengths and honest caveats

Unreal's strengths are visual fidelity, a huge feature set, and strong production tooling. The caveats are well known: it's a big, demanding engine, and the community has long debated performance and shader stutter in UE5 games. Press coverage around the launch of *Halo: Campaign Evolved* in July 2026 revived that debate, which shows how closely players now watch which engine a game is built on.

## Unity: the most versatile engine

**Unity** has taken a different path. Its identity has always been breadth: one editor that targets phones, consoles, PCs, browsers and XR devices, from tiny 2D games to large 3D productions. It's the engine behind a remarkable number of mobile hits.

### Where it is today: Unity 6.6

Unity 6.6 arrived on September 1, 2026. It is a **Supported** release, meaning it gets the same support and critical fixes as an LTS (long-term support) release until the next one, 6.7, arrives. It's also the final release in the Unity 6 family and the stepping stone to Unity 7. Highlights include:

* **Pieces of the new CoreCLR foundation** that Unity 7 is built on.
* **A foundational Content Directory** with build analysis, aimed at smaller and more incremental builds.
* **Better rendering-performance tooling**, plus UI improvements.
* **Apple platform API modernization.**

Unity 6.4, released in March 2026, had already moved the Entity Component System and Project Auditor directly into the editor and launched **Unity Studio**, a browser-based tool for authoring interactive 3D experiences.

A practical note for anyone choosing a version: community guidance in October 2026 is to keep shipping projects on **Unity 6.3 LTS** and start new projects on 6.6. That's advice from community sources, not an official policy.

### Where it's going: Unity 7

Unity revealed Unity 7 at Unite Seoul on July 21, 2026. It's an unusual launch because much of it is arriving *early*, inside Unity 6, so the eventual upgrade is meant to need no rebuilding. The headline changes:

* **CoreCLR replaces Mono** as the C# runtime, bringing .NET 10 and C# 14 and an MSBuild-based project pipeline. In practice that means faster code and a partial domain reload that only recompiles what changed, which Unity says will give a near-instant Play Mode.
* **Surface Cache GI**, a real-time global illumination system, and a rendering pipeline unified around URP.
* **Content Directory workflows** and optional AI features designed for teams that include coding agents.
* **A beta in December 2026 and a full release in Q1 2027.**

It's worth adding some context: Unity 7 (originally "Unity Next") was announced in 2024, reportedly shelved, and has now been revived, so developers sensibly treat the dates as targets.

<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/n-3XvhUzMc0" title="Keynote | Unite Seoul 2026" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy" allowfullscreen></iframe></div>

*The Unite Seoul 2026 keynote where Unity 7 was unveiled (Unity's official channel). [Watch on YouTube](https://www.youtube.com/watch?v=n-3XvhUzMc0).*

### Strengths and caveats

Unity's strength is reach and approachability: a gentle learning curve, a gigantic asset ecosystem, and an unrivalled ability to ship to many platforms from one project. The caveat is that its roadmap has been volatile over the past few years, which is exactly why the CoreCLR transition is being watched so closely.

## Godot and the open-source alternative

No overview is complete without **Godot**, the free, open-source engine that has become the default recommendation for small teams that want full control and no licensing worries. Godot 4.7 was released on June 18, 2026, with HDR output on several platforms, a new soft area-light node, a revamped Asset Store and day-one support for Android XR and Steam Frame. It's lightweight, quick to learn, and especially strong for 2D, and its open-source nature means nobody can change its terms on you.

## Which games were made with which engine?

Engines tend to build their reputation through their games. A few examples (a sampler, not a complete list):

| Engine | Games and projects |
|---|---|
| **Unreal Engine** | *Fortnite*; *Halo: Campaign Evolved* (July 2026, a move away from Halo's former in-house Slipspace engine); *The Witcher 4* (in development, announced to use UE5); *Rocket League* (moving to UE6) |
| **Unity** | *Pokémon GO*; *Monument Valley*; *Call of Duty: Mobile*; *Beat Saber*; *Cuphead*; *Hollow Knight*; *Genshin Impact*; Nintendo's *Pictonico!* (May 2026) |
| **Godot** | *Brotato*; *Cassette Beasts* |

Notice the pattern: Unreal tends to appear on big, graphically ambitious projects, Unity dominates mobile and indie hits, and Godot is a fixture of the indie scene.

## The in-house engines: studios that build their own

Now to the most fascinating category. Some of the biggest studios in the world keep their own proprietary engines. Here's the landscape as of this week:

| Engine | Owner | Known for | Status in 2026 |
|---|---|---|---|
| **Frostbite** | EA / DICE | Debuted with *Battlefield: Bad Company* (2008); *Battlefield 6* | Still the engine for Battlefield; EA teams have been free to use other engines since 2024 |
| **RE Engine, evolving into REX** | Capcom | Debuted with *Resident Evil 7* (2017); *Resident Evil Requiem*, *Pragmata*, *Monster Hunter Wilds*, *Street Fighter 6* | Being evolved step by step into REX, with plans to integrate AI generation |
| **id Tech 8** | id Software (Microsoft) | *Doom: The Dark Ages* (May 2025) | Requires ray-tracing-capable hardware; ray-traced lighting is the foundation |
| **Decima** | Guerrilla (Sony) | *Horizon* series, *Death Stranding* and its sequel | Shared with Kojima Productions; *Horizon Hunters Gathering* announced Feb 2026 |
| **Source 2** | Valve | *Dota 2*, *Half-Life: Alyx*, *Counter-Strike 2*, *Deadlock* | Still receiving major updates; much speculation about future projects, none confirmed |
| **Creation Engine** | Bethesda | *Skyrim*, *Starfield* (Creation Engine 2) | *The Elder Scrolls VI* reportedly on Creation Engine 3, per a Todd Howard interview |
| **RAGE** | Rockstar | *GTA V*, *Red Dead Redemption 2* | *GTA VI* is scheduled for November 19, 2026; reports describe an upgraded RAGE, not a formal technical breakdown |
| **Slipspace** | Halo Studios | *Halo Infinite* | Halo has moved to Unreal Engine 5 |
| **REDengine** | CD Projekt Red | *The Witcher 3*, *Cyberpunk 2077* | *The Witcher 4* is being built in Unreal Engine 5 |

The table hides a story, which is that these engines exist for very specific reasons. Let's dig into a few.

### Frostbite: built for chaos

Frostbite was designed around large-scale multiplayer and destruction, and *Battlefield 6* shows why studios keep it. EA's engineers describe working alongside the Battlefield teams to make the part-based destruction and debris systems more extensible and to rework how destruction events are networked. The game's technical director has also credited the decision to drop PlayStation 4 and Xbox One support for allowing heavier simulation.

But EA rebranded Frostbite in 2024 and stopped requiring teams to use it, and reports have suggested *Mass Effect 5* may use Unreal instead. It's a nice illustration of the push and pull: Battlefield's producers argue that what they're doing wouldn't be possible on a generic engine, while other EA teams take the pragmatic route.

### RE Engine and REX: evolution, not revolution

Capcom's RE Engine debuted with *Resident Evil 7* in 2017 and now powers 27 titles, from horror to fighting games and open-world action. It's praised for a pipeline that turns photogrammetry scans into game assets efficiently, and it even ran *Street Fighter 6* as a Nintendo Switch 2 launch title.

At its October 2026 technology event, Capcom clarified that the next generation, **REX**, won't be a clean-sheet rewrite. The engine will be evolved gradually, and Capcom described a plan to integrate AI generation into it. One component of REX, called RE:Dox, has already been published as open source. Capcom also told shareholders the creative core of games should still be driven by human effort, which is worth keeping in mind when reading the AI headlines.

### id Tech 8: ray tracing as the baseline

id Software's engine behind *Doom: The Dark Ages* is the first id Tech generation to require dedicated ray-tracing hardware. Digital Foundry's early analysis found ray-traced reflections and ray-traced global illumination working together with a virtualized-geometry-style system and physics, all while targeting 60 FPS with large numbers of enemies on screen. That analysis noted it wasn't yet full path tracing, though the engine has since been described as supporting it.

<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/1VawgKaIfbg" title="Digital Foundry analysis of DOOM: The Dark Ages and id Tech 8" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy" allowfullscreen></iframe></div>

*Digital Foundry's tech analysis of DOOM: The Dark Ages, as linked from Wccftech's coverage. [Watch on YouTube](https://www.youtube.com/watch?v=1VawgKaIfbg).*

### Decima: the shared engine

Guerrilla Games' Decima engine is named after the Dejima trading post, in honour of its collaboration with Kojima Productions, which used it for *Death Stranding* and its sequel. At the CEDEC conference in July 2026, Kojima Productions walked through the story of how it selected the engine for *Death Stranding*, and earlier in the year its technology chief said Decima lets the team do things that would be difficult to achieve elsewhere. It's a rare example of a first-party engine shared outside its original studio.

Guerrilla also publishes technical talks about the engine on its website. This GDC session on Horizon Zero Dawn's GPU-based procedural placement is a window into the kind of tools a studio builds when it owns its engine:

<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/ToCozpl1sYY" title="GPU-Based Run-Time Procedural Placement in Horizon: Zero Dawn (GDC)" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy" allowfullscreen></iframe></div>

*GPU-Based Run-Time Procedural Placement in Horizon: Zero Dawn (GDC Festival of Gaming). [Watch on YouTube](https://www.youtube.com/watch?v=ToCozpl1sYY).*

### Source 2: quiet, constant evolution

Valve's Source 2 was announced in 2015 as free to content developers, with *Dota 2* the first major game to move to it. It now underpins *Half-Life: Alyx*, *Counter-Strike 2*, *Deadlock* and the third-party game s&box. A recent *Counter-Strike 2* beta branch moved the game onto newer Source 2 code and replaced older animation logic with a system the community calls Animgraph 2, aimed at cutting CPU load.

A fair warning: dataminers regularly tie Source 2 code strings to a rumoured project called HLX, widely guessed to be *Half-Life 3*, and have made claims about *Team Fortress 2* moving to Source 2. Valve has confirmed neither, so treat all of that as speculation.

### The big trend: who is switching?

Three studios illustrate the tug-of-war. **Halo Studios** announced in October 2024 that future games would move from Slipspace to Unreal Engine 5, and *Halo: Campaign Evolved* launched on it in July 2026. **CD Projekt Red** is building *The Witcher 4* in Unreal Engine 5 rather than extending REDengine. And **EA** gave its teams freedom to pick other engines.

On the other side, **Capcom**, **id Software**, **Guerrilla** and **Valve** are doubling down on their own technology. The deciding factor seems to be how closely the engine is tied to the studio's *signature* experience. Destruction for Battlefield, photogrammetry-heavy realism for Resident Evil, and ray-traced speed for Doom are all things these teams can tune at the lowest level only because they own the engine.

## What comes next

Several trends are visible across every engine:

1. **Convergence of creator and developer ecosystems.** Unreal Engine 6's merger with UEFN is the clearest example: a single toolset for both professionals and user-generated content.
2. **Modernised runtimes.** Unity's CoreCLR move and Epic's Verse language are both bets that the way you write game code needs a rethink.
3. **Ray tracing as a default.** Engines like id Tech 8 now assume it; others are scaling dynamic global illumination down to handheld-class hardware like Switch 2.
4. **AI hooks in the editor.** Unreal's MCP plugin, Unity 7's collaboration pitch and Capcom's REX plan all point to AI becoming part of the engine toolchain, with plenty of open questions about how much studios will actually adopt.
5. **Open standards and openness.** Epic open-sourcing Lore and promising open specifications, and Capcom publishing RE:Dox, hint at a slow shift toward sharing infrastructure.

## So which engine should you learn?

If you're picking one to learn or build with, here's a rough rule of thumb, not a law:

| If you want to... | Consider |
|---|---|
| Make visually ambitious 3D games, or work in film or visualization | **Unreal Engine** |
| Ship to many platforms, especially mobile, or build a small to mid-size game quickly | **Unity** |
| Make a small game, a 2D game, or work fully in open source | **Godot** |
| Work at a specific studio | Learn what *they* use, which may well be proprietary |

A closing thought: the engine you choose matters less than understanding what all of them have in common. Rendering, simulation, scripting and tools are the same ideas wearing different clothes. Learn those, and you can move between engines when the industry inevitably changes its mind, as it just did in 2026.

---

### Keep exploring

* The full [State of Unreal 2026 keynote](https://www.youtube.com/watch?v=xXGSvLH9zAs) (embedded at the top of this page)
* [Unity 6.6 announcement](https://discussions.unity.com/t/unity-6-6-is-now-available/1735357) and the [Unity 7 roadmap coverage](https://www.invenglobal.com/articles/24003/unity-engine-7-changing-the-development-paradigm-and-the-roadmap-ahead)
* [How Battlefield 6 reimagined destruction](https://www.ea.com/en/news/how-battlefield-6-redefined-destruction)
* [Capcom's REX plan](https://www.digitalcitizen.life/capcom-rex-re-engine-evolution-plan/)
* [Henry Lowood's history of the term "game engine"](https://www.kinephanos.ca/2014/game-engines-and-game-history/)
