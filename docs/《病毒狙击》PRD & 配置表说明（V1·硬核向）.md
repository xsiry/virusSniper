# 《病毒狙击》PRD & 配置表说明（V1·硬核向）

## 目录

1. 项目概述
2. 核心体验与玩法规则
3. 系统设计（关卡/敌人/武器/成长/掉落）
4. 数值规则（硬核版公式）
5. 配置表结构与字段定义
6. 示例配置（可直接跑）
7. 资源清单（美术/音效/UI/特效）
8. 开发排期与里程碑（MVP→上线）
9. 验收标准与数据指标

------

## 1. 项目概述

**平台**：微信小游戏（竖屏）
 **玩法**：底部发射针 → 命中旋转病毒弱点 → 机制逐步叠加（护盾/回血/反弹/假弱点/多目标）
 **卖点**：判定清晰、反馈强、硬核但公平（概率+保底避免脸黑）
 **首发内容**：30关主线 + 通关解锁无尽模式（可选二期）

------

## 2. 核心体验与玩法规则

### 2.1 玩家操作

- 单指点击/按住发射（建议：**点击发射**，易控节奏）
- 发射器位于底部中央，针直线上行
- 命中判定分三类：`WeakPoint / Shield / Miss`

### 2.2 判定规则

- **命中弱点**：扣血/破坏弱点、触发连击计时刷新
- **命中护盾**：不扣血或极低扣血（建议不扣血），触发护盾受击反馈；硬核模式算失误
- **空枪**：硬核模式算失误

### 2.3 关卡目标

- 将病毒 HP 降为 0 或击破全部弱点（建议：HP为主，弱点作为“必经命中点”）
- 通关进入下一关；Boss关有阶段变化

------

## 3. 系统设计

### 3.1 关卡结构（30关）

- 1–5：教学（旋转/弱点识别）
- 6–10：护盾（卫星/能量网），第10关Boss
- 11–15：高速/变速 + 回血，第15关回血Boss
- 16–20：反弹技巧 + 技巧Boss
- 21–25：复合机制（护盾+回血+反弹/限针/多目标）
- 26–30：终极挑战（假弱点/随机护盾/三阶段Boss）

> 关卡数值表已在前文给出，可直接填入 LevelConfig。

### 3.2 敌人体系（10类）

Standard / VariableSpin / OrbitalShield / EnergyShield / Regenerator / RearCore / Reflector / Decoy / Fusion / FinalBoss
 每类至少4个变种（只改1–2个视觉/行为参数），保证低成本扩展。

### 3.3 武器（MVP）

- NormalNeedle：默认
- SuperNeedle：穿盾/高伤（由概率+保底产出）

> 二期扩展：减速针/反弹针/连锁针/爆裂针

### 3.4 掉落与商店（MVP轻量）

- 掉落：金币、超级针碎片、强化卡（稀有）
- 商店：金币购买超级针/碎片（价格随关卡开放）

> 硬核向：商店价格偏高，核心仍靠“打得好”获取

### 3.5 成长（建议分期）

- MVP可只做：金币累计 + 超级针库存
- 二期做：永久升级（初始针数/连击容错/超级针碎片收益等）

------

## 4. 数值规则（硬核版）

### 4.1 连击窗口随关卡收紧

Tcombo(L)=clamp(1.15−0.01⋅(L−1), 0.75, 1.15)Tcombo(L)=clamp(1.15 - 0.01\cdot(L-1),\ 0.75,\ 1.15)Tcombo(L)=clamp(1.15−0.01⋅(L−1), 0.75, 1.15)

### 4.2 失误惩罚（硬核）

失误事件：`Miss` 或 `HitShield` 或 `Timeout`

- `combo = floor(combo * 0.4)`
- `comboQuality -= 1`

### 4.3 连击倍率（慢增长）

M(combo)=1+0.8⋅(1−e−combo/10)M(combo)=1+0.8\cdot(1-e^{-combo/10})M(combo)=1+0.8⋅(1−e−combo/10)

### 4.4 掉落质量因子

Q=clamp(1+0.08⋅combomax+0.15⋅comboQuality, 0.4, 2.0)Q = clamp(1 + 0.08\cdot combo_{max} + 0.15\cdot comboQuality,\ 0.4,\ 2.0)Q=clamp(1+0.08⋅combomax+0.15⋅comboQuality, 0.4, 2.0)

掉落概率：

p[i]=clamp(p0[i]⋅Q, 0, pMax[i])p[i]=clamp(p0[i]\cdot Q,\ 0,\ pMax[i])p[i]=clamp(p0[i]⋅Q, 0, pMax[i])

推荐初值：

- 金币：`p0=0.22 pMax=0.55`
- 超级针碎片：`p0=0.04 pMax=0.12`
- 强化卡：`p0=0.015 pMax=0.04`

### 4.5 超级针（概率+保底）

概率：

pcombo=clamp(0.008⋅(1+0.5⋅(M−1))⋅(1+0.25⋅comboQuality), 0.003, 0.05)p_{combo}=clamp(0.008\cdot(1+0.5\cdot(M-1))\cdot(1+0.25\cdot comboQuality),\ 0.003,\ 0.05)pcombo=clamp(0.008⋅(1+0.5⋅(M−1))⋅(1+0.25⋅comboQuality), 0.003, 0.05)

保底进度：

Δg=0.035+0.03⋅(M−1)+0.02⋅max⁡(0,comboQuality)\Delta g = 0.035 + 0.03\cdot(M-1) + 0.02\cdot\max(0, comboQuality)Δg=0.035+0.03⋅(M−1)+0.02⋅max(0,comboQuality)

失败继承：

gaugenext=0.2⋅gaugegauge_{next}=0.2\cdot gaugegaugenext=0.2⋅gauge

### 4.6 回血与连击绑定

regenRate=regenBase1+1.6⋅(M−1)+0.8⋅max⁡(0,comboQuality)regenRate = \frac{regenBase}{1+1.6\cdot(M-1)+0.8\cdot\max(0,comboQuality)}regenRate=1+1.6⋅(M−1)+0.8⋅max(0,comboQuality)regenBase

------

## 5. 配置表结构与字段定义（核心交付）

> 建议采用 **表驱动**：Excel（策划）→ 导出 JSON（程序读取）

### 5.1 LevelConfig（关卡表）

| 字段                | 类型   | 说明                                     | 示例          |
| ------------------- | ------ | ---------------------------------------- | ------------- |
| levelId             | int    | 关卡编号                                 | 15            |
| enemyArchetype      | string | 病毒类型                                 | "Regenerator" |
| variantId           | string | 变种编号                                 | "R3"          |
| hp                  | int    | 血量                                     | 26            |
| weakPointCount      | int    | 弱点数                                   | 4             |
| rotateSpeed         | float  | 基础角速度（可理解为 rad/s或自定义单位） | 1.6           |
| speedMode           | string | fixed/variable                           | "variable"    |
| speedMin            | float  | 变速下限                                 | 0.7           |
| speedMax            | float  | 变速上限                                 | 1.9           |
| weakPointMove       | bool   | 弱点是否移动                             | true          |
| shieldEnabled       | bool   | 是否有护盾                               | true          |
| shieldType          | string | orbital/energy/breakable                 | "energy"      |
| shieldCount         | int    | 护盾数量                                 | 2             |
| shieldSpeed         | float  | 护盾转速系数                             | 1.3           |
| regenEnabled        | bool   | 是否回血                                 | true          |
| regenBase           | float  | 基础回血速率（HP/s）                     | 0.8           |
| regenDelay          | float  | 未命中弱点后多久开始回血                 | 1.5           |
| reflectEnabled      | bool   | 是否反弹机制                             | false         |
| reflectObjectType   | string | fixed/move/rotate                        | "move"        |
| reflectObjectCount  | int    | 反弹物体数量                             | 2             |
| reflectMaxBounces   | int    | 最大反弹次数                             | 2             |
| limitNeedlesEnabled | bool   | 是否限针                                 | false         |
| limitNeedles        | int    | 限针数量                                 | 15            |
| multiTargetEnabled  | bool   | 是否多目标                               | false         |
| targetCount         | int    | 目标数                                   | 2             |
| bossPhases          | json   | Boss阶段配置                             | 见示例        |

### 5.2 EnemyArchetypeConfig（病毒类型配置）

| 字段           | 类型   | 说明                             |
| -------------- | ------ | -------------------------------- |
| archetypeId    | string | 类型ID（Standard等）             |
| baseScale      | float  | 基础大小                         |
| hitShake       | float  | 受击抖动幅度                     |
| coreGlow       | float  | 内核亮度                         |
| shellOpacity   | float  | 外膜透明度                       |
| weakPointStyle | string | 弱点样式（crack/pulse等）        |
| deathStyle     | string | 死亡样式（shatter/peel/explode） |

### 5.3 VariantConfig（变种表）

| 字段              | 类型   | 说明                     |
| ----------------- | ------ | ------------------------ |
| variantId         | string | 如 R3 / O2               |
| archetypeId       | string | 对应类型                 |
| colorTheme        | string | 颜色主题（可映射到色板） |
| noiseStrength     | float  | 纹理噪声                 |
| pulseFreq         | float  | 脉冲频率                 |
| shieldOrbitRadius | float  | 卫星轨道半径（若适用）   |
| gridDensity       | float  | 网格密度（若适用）       |
| decoyRatio        | float  | 假弱点占比（若适用）     |

### 5.4 EconomyConfig（经济/掉落）

| 字段             | 类型  | 说明               |
| ---------------- | ----- | ------------------ |
| dropCoinP0       | float | 金币基础概率       |
| dropCoinPMax     | float | 金币概率上限       |
| dropShardP0      | float | 超级针碎片基础概率 |
| dropShardPMax    | float | 上限               |
| dropCardP0       | float | 强化卡基础概率     |
| dropCardPMax     | float | 上限               |
| superNeedlePBase | float | 超级针基础触发     |
| superNeedlePCap  | float | 上限               |
| superNeedlePMin  | float | 下限               |
| gaugeCarryFail   | float | 失败继承比例       |

### 5.5 CombatFormulaConfig（公式参数）

| 字段               | 类型  | 说明 |
| ------------------ | ----- | ---- |
| comboBase          | float | 1.15 |
| comboDecayPerLevel | float | 0.01 |
| comboMin           | float | 0.75 |
| M_alpha            | float | 0.8  |
| M_k                | float | 10   |
| Q_comboMaxCoef     | float | 0.08 |
| Q_qualityCoef      | float | 0.15 |
| Q_min              | float | 0.4  |
| Q_max              | float | 2.0  |
| regen_delta        | float | 1.6  |
| regen_eta          | float | 0.8  |

------

## 6. 示例配置（可直接跑）

### 6.1 Level 15（回血Boss示例）

```
{
  "levelId": 15,
  "enemyArchetype": "Regenerator",
  "variantId": "R3",
  "hp": 26,
  "weakPointCount": 4,
  "rotateSpeed": 1.6,
  "speedMode": "variable",
  "speedMin": 1.2,
  "speedMax": 2.0,
  "weakPointMove": true,
  "shieldEnabled": true,
  "shieldType": "orbital",
  "shieldCount": 2,
  "shieldSpeed": 1.2,
  "regenEnabled": true,
  "regenBase": 0.8,
  "regenDelay": 1.5,
  "reflectEnabled": false,
  "limitNeedlesEnabled": false,
  "multiTargetEnabled": false,
  "bossPhases": [
    {"hpPct": 0.7, "addShield": false, "speedMul": 1.0},
    {"hpPct": 0.4, "addShield": true,  "speedMul": 1.1},
    {"hpPct": 0.2, "addShield": true,  "speedMul": 1.2, "regenMul": 1.2}
  ]
}
```

### 6.2 EconomyConfig（硬核推荐默认）

```
{
  "dropCoinP0": 0.22, "dropCoinPMax": 0.55,
  "dropShardP0": 0.04, "dropShardPMax": 0.12,
  "dropCardP0": 0.015, "dropCardPMax": 0.04,

  "superNeedlePBase": 0.008,
  "superNeedlePMin": 0.003,
  "superNeedlePCap": 0.05,

  "gaugeA": 0.035,
  "gaugeB": 0.03,
  "gaugeC": 0.02,
  "gaugeCarryFail": 0.2
}
```

------

## 7. 资源清单（按MVP与二期拆分）

### 7.1 美术资源（MVP必须）

**UI**

- 主界面：开始/设置/商店/排行榜入口
- 战斗HUD：血条、关卡号、针数、超级针按钮、连击数字
- 结算页：胜利/失败/奖励展示

**病毒（至少）**

- 10类病毒基础造型（可先做5类，剩余用换皮过渡）
- 每类至少2个变种（30关足够用）

**场景**

- 背景1套（深色科技背景 + 微粒子）
- 反弹物体：固定挡板、移动挡板（各1套）

**针**

- 普通针、超级针（2个核心资源）

### 7.2 特效资源（MVP必须）

- 命中弱点：闪白、裂纹扩散、轻震
- 命中护盾：波纹/网格过载
- 死亡：普通碎裂（Boss可先简化为强化版碎裂）

### 7.3 音效资源（MVP必须）

- 发射、命中弱点、命中护盾、连击提示、胜利、失败、Boss阶段变化

### 7.4 二期扩展

- 更多针类型
- Boss专属演出（外壳剥离/过载放电）
- 无尽模式UI与排行榜细化

------

## 8. 开发排期与里程碑（建议4周MVP）

> 以“1程序 + 1美术 + 1策划/兼测试”为参考；人多可并行压缩。

### Week 1：核心战斗闭环（可玩）

- 发射、碰撞判定、弱点扣血、血条UI
- 病毒旋转（固定/变速）
- 基础连击（窗口+计数）
- 关卡加载（读取LevelConfig）
   **里程碑**：能打通 1–5 关

### Week 2：机制扩展（护盾/回血/掉落）

- 护盾（orbital 或 energy 先实现一种）
- 回血机制（按公式，连击抑制）
- 掉落系统（金币/碎片/强化卡）
- 超级针（概率+保底gauge）
   **里程碑**：能打通 1–15 关（含回血Boss）

### Week 3：反弹&复合 + 30关内容落地

- 反弹挡板（move型）+ 反射命中弱点
- 假弱点（可先做视觉与判定，不做惩罚）
- 复合关卡调通（21–25）
- Boss阶段系统（hpPct触发）
   **里程碑**：30关可跑通（难度需调）

### Week 4：打磨上线（体验与性能）

- 特效/音效接入、手感调优（发射节奏/震动/时间缩放可选）
- 新手引导（1–3关轻提示）
- 性能与兼容（低端机粒子、碰撞优化）
- 埋点与数据面板（通关率/失败点/超级针触发）
   **里程碑**：可提审上线版本

------

## 9. 验收标准与数据指标（上线必看）

### 9.1 功能验收

- 30关可配置运行，切换机制无崩溃
- 连击、掉落、超级针保底逻辑正确
- 回血关“追连击能明显压制回血”
- 判定清晰：弱点 > 护盾 > 背景

### 9.2 体验指标（首发建议）

- 1–5关通关率 > 70%
- 10关Boss通关率 40–55%
- 15关回血Boss通关率 25–40%
- 超级针：普通玩家一局至少能见到1次（靠保底），高手更频繁