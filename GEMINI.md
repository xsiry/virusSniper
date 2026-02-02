# Virus Sniper - Project Context

## Project Overview

**Virus Sniper (《病毒狙击》)** is a hardcore arcade shooting game developed for WeChat Mini Games. The player controls a needle launcher at the bottom of the screen, aiming to hit weak points on a rotating virus core while dealing with various mechanics like shields, regeneration, and reflection.

*   **Engine:** Cocos Creator 3.8.8
*   **Language:** TypeScript
*   **Platform:** WeChat Mini Game (Vertical orientation)
*   **Design Philosophy:** Hardcore, skill-based, clear feedback, probabilistic but fair (pity systems).

## Directory Structure

The project follows a standard Cocos Creator structure with a focus on modularity and table-driven configuration.

*   `assets/`: Main game assets.
    *   `scripts/`: Source code.
        *   `AppRoot.ts`: Application entry point/root manager.
        *   `battle/`: Core battle logic (mechanics, systems).
        *   `core/`: Core engine extensions or base classes.
        *   `data/`: Configuration data management and loading.
        *   `debug/`: Debugging tools.
        *   `entities/`: Game entities (Virus, Needle, Shield, etc.).
        *   `ui/`: User Interface components and management.
        *   `utils/`: Helper functions.
    *   `Main.scene`: The primary game scene.
*   `docs/`: Project documentation (PRD, specs).
    *   `《病毒狙击》PRD & 配置表说明（V1·硬核向）.md`: Detailed Game Design Document.
*   `scripts/`: Node.js scripts for build and validation tasks.
*   `schemas/`: JSON schemas for configuration validation.

## Setup and Development

### Prerequisites

*   Node.js & npm
*   Cocos Creator 3.8.8

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

### Key Commands

*   **Validate Configs:** Ensures configuration JSON files match their schemas.
    ```bash
    npm run validate:configs
    ```
*   **Check Spec Sync:** Verifies synchronization between specs and code.
    ```bash
    npm run check:spec-sync
    ```

### Building and Running

*   **Editor:** Open the project directory in Cocos Creator 3.8.8.
*   **Preview:** Use the "Play" button in the Cocos Creator editor to preview the game in the browser or simulator.
*   **Build:** Use the Project -> Build menu in Cocos Creator to build for WeChat Mini Game or other platforms.

## Development Conventions

*   **Table-Driven Configuration:** The game relies heavily on data tables (JSON) for level design (`LevelConfig`), enemy types (`EnemyArchetypeConfig`), and economy (`EconomyConfig`). Always validate configs after modifying them.
*   **Component-Based:** Logic is distributed across Cocos Creator Components (`cc.Component`).
*   **Strict Typing:** TypeScript is used throughout. Ensure types are properly defined, especially for configuration data.
*   **Hardcore Mechanics:** Gameplay logic (combo timing, drop rates) follows specific formulas defined in the PRD (Section 4). Changes to these should be carefully vetted against the design doc.

## Key Documentation

Refer to `docs/《病毒狙击》PRD & 配置表说明（V1·硬核向）.md` for:
*   Detailed gameplay rules and formulas.
*   Configuration field definitions.
*   Asset requirements.
