# RetroAchievements integration

## Current status

The frontend can write RetroArch's native RetroAchievements configuration, but the feature only works when the bundled RetroArch WebAssembly runtime was compiled with `HAVE_CHEEVOS=1`. The existing prebuilt core archives do not gain achievement support just because the config options are present.

RetroAchievements compatibility is core-specific. "All systems" means all supported EmulatorJS systems whose selected libretro core is compatible with RetroAchievements; it cannot make unsupported cores or game sets compatible.

## Required runtime build change

The EmulatorJS core build uses `EmulatorJS/RetroArch/Makefile.emulatorjs`. That Makefile currently enables networking but does not set `HAVE_CHEEVOS`, so the RetroArch achievement implementation is excluded from the compiled runtime.

After the build checkout has cloned the RetroArch source, apply this branch's helper to its Makefile:

```sh
node scripts/enable-retroachievements-build.js /path/to/compile/RetroArch/Makefile.emulatorjs
```

The helper adds `HAVE_CHEEVOS ?= 1` and is safe to run more than once. Build every required normal/threaded/legacy core variant again with the updated RetroArch source, then publish/use the resulting core archives with this frontend. A normal frontend-only `npm run build` does not rebuild these core archives.

For an automated production build, make this one-line change permanent in the RetroArch fork used by the EmulatorJS build pipeline. Keep `HAVE_NETWORKING=1` enabled; RetroAchievements needs network access. The build must include the rcheevos sources and Emscripten HTTP implementation supplied by RetroArch's `Makefile.common`.

## Runtime settings

- RetroAchievements: enabled by default; can be disabled from the settings menu.
- Hardcore mode: disabled by default; can be enabled separately.
- Username/password: supplied through the settings UI or `EJS_retroAchievements = { username, password }` in the embed configuration.
- The settings are read when the emulator runtime starts, so restart the game after changing credentials or achievement settings.

The UI stores credentials in the browser's local storage for the current site when local storage is enabled. This is not encrypted storage. Do not use it on a shared or untrusted browser profile; use a dedicated RetroAchievements account and clear the saved account from browser storage when finished. Never log credentials or include them in bug reports.

## Verification checklist

1. Build the frontend and a core archive from the patched RetroArch source.
2. Run a known RetroAchievements-supported game with an exact ROM revision that has an achievement set.
3. Confirm successful authentication and game identification in RetroArch's achievement notifications.
4. Trigger a known easy achievement and verify it appears on the account's RetroAchievements profile.
5. Verify that disabling RetroAchievements suppresses authentication/unlocks.
6. With Hardcore enabled, verify savestates, rewind, fast-forward, slow motion and cheats are rejected by the runtime.
7. Test each core family separately; a successful SNES test does not prove all systems are supported.
