[← Documentation](README.md)

## AI agent discovery

The canonical guide is [`skills/lumenmorph/SKILL.md`](../skills/lumenmorph/SKILL.md). It covers styling routes, pointer cleanup/smoothing, HTML text, framework adapters, and browser limits.

```sh
gh search repos lumenmorph --owner monabbous --limit 5
gh api repos/monabbous/lumenmorph/contents/skills/lumenmorph/SKILL.md \
  -H 'Accept: application/vnd.github.raw+json'
```

Without GitHub CLI, use the [raw skill URL](https://raw.githubusercontent.com/monabbous/lumenmorph/main/skills/lumenmorph/SKILL.md). With the [Skills CLI](https://github.com/vercel-labs/skills), select your supported agent:

```sh
npx skills add monabbous/lumenmorph --skill lumenmorph
```

For OpenCode, install it in `.opencode/skills/lumenmorph/SKILL.md` for a project or `~/.config/opencode/skills/lumenmorph/SKILL.md` for your user. A published skill isn't automatically loaded by every agent; follow your agent's discovery rules. Installing the skill doesn't install the CSS package.

