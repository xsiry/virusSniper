# Release Checklist - WeChat MiniGame (Cocos Creator 3.8)

## References
- Cocos Creator publish to WeChat MiniGame:
  https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-wechatgame.html
- WeChat MiniGame guide (upload / review / release):
  https://developers.weixin.qq.com/minigame/en/dev/guide/#Upload-to-the-trial-version
  https://developers.weixin.qq.com/minigame/en/dev/guide/#Submit-for-review
  https://developers.weixin.qq.com/minigame/en/dev/guide/#Confirm-release
- Performance overview:
  https://developers.weixin.qq.com/minigame/en/dev/guide/performance/perf-overview.html

## Preconditions
- WeChat appid is available.
- WeChat DevTools is installed.
- Validation commands pass:
  - node scripts/validate-schemas.mjs
  - node scripts/check-spec-sync.mjs
- Dev stage build version format: 0.1.0+YYYYMMDD

## Build (Cocos Creator)
- Open project in Cocos Creator 3.8.8.
- Build -> WeChat MiniGame.
- Set appid and build options.
- Set build version to match dev format (0.1.0+YYYYMMDD).
- Output path (default): build/wechatgame
- Open output in WeChat DevTools.

## Package size
- First package <= 4MB.
- Remote assets enabled for large resources.
- Enable asset versioning/MD5 for cache control.

## QA checks
- Run full playthrough (levels 1-30).
- Hit priority: WeakPoint > Shield > Miss.
- DebugPanel visible in dev builds.
- Stable FPS, no memory growth, no long stalls.

## Submission
- Upload to trial version in WeChat DevTools.
- Submit for review in WeChat MiniGame backend.
- Confirm release after approval.

## Post-release
- Monitor crash logs and performance alerts.
- Track feedback and hotfix strategy (config-only vs code changes).
- Re-run validation after any config update.
