# ProblemSource
is a framework, built on PixelMagic, for creating training apps.
Some concepts:
 * TrainingPlan
    * definitions of which games to play and when
    * triggers (medals, game settings modifications etc)
 * Metaphor
    * skinning of app 
    * progress indication within games
    * "main menu" or hub from where games are launched
 * Phase / Problem structure
 * Logging and syncing of results

This code has been ripped out of a larger monolith and was published in this state only to make it officially open source. There's a long list of TODOs before it's suitable for use in actual projects, some being:
* dependency injection instead of statics
* proper styling system
* remove duplicate functionality (similar functions from multiple authors)
* redesign phases system
* use external logging system