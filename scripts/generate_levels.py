import json


def create_level(
    level_id,
    archetype="Standard",
    variant="S1",
    hp=5,
    wp_count=2,
    rotate_speed=0.6,
    shield_enabled=False,
    regen_enabled=False,
    reflect_enabled=False,
    shield_type=None,
    boss_phases=None,
    limit_needles_enabled=False,
    limit_needles=None,
):
    level = {
        "levelId": level_id,
        "enemyArchetype": archetype,
        "variantId": variant,
        "hp": hp,
        "weakPointCount": wp_count,
        "rotateSpeed": rotate_speed,
        "speedMode": "fixed",
        "weakPointMove": False,
        "shieldEnabled": shield_enabled,
        "regenEnabled": regen_enabled,
        "reflectEnabled": reflect_enabled,
        "limitNeedlesEnabled": limit_needles_enabled,
        "multiTargetEnabled": False,
    }

    if limit_needles_enabled and limit_needles is not None:
        level["limitNeedles"] = limit_needles

    if shield_enabled and shield_type:
        level["shieldType"] = shield_type
        level["shieldCount"] = 2 if level_id > 8 else 1
        level["shieldSpeed"] = 1.0

    if regen_enabled:
        level["regenBase"] = 0.8
        level["regenDelay"] = 1.5

    if reflect_enabled:
        level["reflectObjectType"] = "move"
        level["reflectObjectCount"] = 2
        level["reflectMaxBounces"] = 1

    if boss_phases:
        level["bossPhases"] = boss_phases
        level["speedMode"] = "variable"
        level["speedMin"] = rotate_speed * 0.8
        level["speedMax"] = rotate_speed * 1.5

    # Tuning based on level
    if level_id > 10:
        level["weakPointMove"] = True

    return level


levels = []

# 1-5: Basic
for i in range(1, 6):
    hp = 5 + i
    speed = 0.6 + (i * 0.1)
    levels.append(
        create_level(
            i, "Standard", "S1", hp=hp, wp_count=2 + (i // 3), rotate_speed=speed
        )
    )

# 6-10: Shield (10 Boss)
for i in range(6, 11):
    hp = 12 + (i - 6) * 2
    speed = 1.0 + (i - 6) * 0.1
    s_type = "orbital" if i < 9 else "energy"
    if i == 10:  # Boss
        phases = [
            {"hpPct": 0.6, "addShield": True, "speedMul": 1.2},
            {"hpPct": 0.3, "addShield": True, "speedMul": 1.5},
        ]
        levels.append(
            create_level(
                i,
                "OrbitalShield",
                "O2",
                hp=25,
                wp_count=4,
                rotate_speed=1.2,
                shield_enabled=True,
                shield_type="orbital",
                boss_phases=phases,
            )
        )
    else:
        levels.append(
            create_level(
                i,
                "OrbitalShield",
                "O1",
                hp=hp,
                wp_count=3,
                rotate_speed=speed,
                shield_enabled=True,
                shield_type=s_type,
            )
        )

# 11-15: Regen (15 Boss)
for i in range(11, 16):
    hp = 18 + (i - 11) * 2
    speed = 1.2 + (i - 11) * 0.1
    if i == 15:  # Boss
        phases = [
            {"hpPct": 0.7, "addShield": False, "speedMul": 1.0},
            {"hpPct": 0.4, "addShield": True, "speedMul": 1.1},
            {"hpPct": 0.2, "addShield": True, "speedMul": 1.2, "regenMul": 1.2},
        ]
        levels.append(
            create_level(
                i,
                "Regenerator",
                "R3",
                hp=35,
                wp_count=4,
                rotate_speed=1.5,
                regen_enabled=True,
                shield_enabled=True,
                shield_type="orbital",
                boss_phases=phases,
            )
        )
    else:
        levels.append(
            create_level(
                i,
                "Regenerator",
                "R1",
                hp=hp,
                wp_count=3,
                rotate_speed=speed,
                regen_enabled=True,
            )
        )

# 16-20: Reflect (20 Boss)
for i in range(16, 21):
    hp = 25 + (i - 16) * 2
    speed = 1.4 + (i - 16) * 0.1
    if i == 20:  # Boss
        phases = [{"hpPct": 0.5, "weakPointMove": True, "speedMul": 1.5}]
        levels.append(
            create_level(
                i,
                "Reflector",
                "B1",
                hp=45,
                wp_count=4,
                rotate_speed=1.8,
                reflect_enabled=True,
                boss_phases=phases,
            )
        )
    else:
        levels.append(
            create_level(
                i,
                "Reflector",
                "B1",
                hp=hp,
                wp_count=3,
                rotate_speed=speed,
                reflect_enabled=True,
            )
        )

# 21-25: Composite (25 Boss)
for i in range(21, 26):
    hp = 35 + (i - 21) * 3
    speed = 1.6 + (i - 21) * 0.1
    if i == 25:  # Boss
        phases = [
            {"hpPct": 0.6, "addShield": True, "speedMul": 1.3},
            {"hpPct": 0.3, "regenMul": 2.0, "speedMul": 1.5},
        ]
        levels.append(
            create_level(
                i,
                "Fusion",
                "F1",
                hp=60,
                wp_count=5,
                rotate_speed=2.0,
                shield_enabled=True,
                shield_type="energy",
                regen_enabled=True,
                boss_phases=phases,
            )
        )
    else:
        levels.append(
            create_level(
                i,
                "Fusion",
                "F1",
                hp=hp,
                wp_count=4,
                rotate_speed=speed,
                shield_enabled=True,
                shield_type="orbital",
                regen_enabled=True,
            )
        )

# 26-30: Hard (30 Final Boss)
for i in range(26, 31):
    hp = 50 + (i - 26) * 4
    speed = 1.8 + (i - 26) * 0.1
    if i == 30:  # Final Boss
        phases = [
            {"hpPct": 0.8, "addShield": True, "speedMul": 1.2},
            {"hpPct": 0.5, "weakPointMove": True, "speedMul": 1.5},
            {"hpPct": 0.2, "regenMul": 3.0, "speedMul": 2.0, "addShield": True},
        ]
        levels.append(
            create_level(
                i,
                "FinalBoss",
                "X1",
                hp=100,
                wp_count=6,
                rotate_speed=2.5,
                shield_enabled=True,
                shield_type="breakable",
                regen_enabled=True,
                reflect_enabled=True,
                boss_phases=phases,
            )
        )
    else:
        levels.append(
            create_level(
                i,
                "Decoy",
                "D1",
                hp=hp,
                wp_count=4,
                rotate_speed=speed,
                shield_enabled=True,
                shield_type="energy",
                limit_needles_enabled=True,
                limit_needles=15,
            )
        )
        if i == 29:  # Last normal level
            levels[-1]["limitNeedles"] = 20

print(json.dumps(levels, indent=2))
