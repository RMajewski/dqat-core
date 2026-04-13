# 📦 dqat-core

**dqat-core** is part of the **DQAT (Delta Quadrant Acceptance Testing)** ecosystem.

The heart of the DQAT framework, providing directives, test context, mocking facilities, and deterministic execution. It defines the essential ports and contracts that other modules build upon.

**Status**: [![Tuvok](https://github.com/RMajewski/dqat-core/actions/workflows/tuvok.yml/badge.svg)](https://github.com/RMajewski/dqat-core/actions/workflows/tuvok.yml)

---

## 🖖 Continuous Integration – Tuvok

All commits and pull requests are scanned by the **Tuvok** workflow (named after Voyager’s Security Officer).
Tuvok ensures that:

- 📡 Repository is checked out and dependencies are replicated
- 🔍 Source code passes linting (`pnpm lint:dev` and `pnpm lint:ci`)
- 🛡️ Unit tests are executed in a secure Holodeck simulation (`pnpm test:unit:ci`)

Only when all diagnostics are green, changes can be merged into protected branches (`alpha`, `beta`, `main`).
This guarantees that every deployment via **Janeway** (the release workflow) builds on a secure and verified codebase.

---

## 🚀 Features

coming soon

---

## 📘 Documentation

coming soon

---

## 🛠️ Installation

```bash
pnpm add @RMajewski/dqat-core
```

or (for development):

```bash
git clone https://github.com/RMajewski/dqat-core.git
cd dqat-core
pnpm install
```

---

## 🧪 Usage

```ts
import { Example } from '@RMajewski/dqat-core';

const result = Example.doSomething();
```

> Adapt this section with code snippets or scenarios relevant to the module.

---

## 🤝 Contributing

Contributions are welcome!
Please follow the [semantic-release commit guidelines](https://semantic-release.gitbook.io/semantic-release/#commit-message-format) and ensure all tests and lint checks pass before opening a Pull Request.

---

## 📜 License

This project is licensed under the **European Union Public Licence (EUPL) v1.2**.
See the files [LICENSE](./LICENSE) (English) and [LICENSE_DE](./LICENSE_DE) (Deutsch) for details.

---

## 📄 Notices

See [NOTICE.md](./NOTICE.md) and [NOTICE_DE.md](./NOTICE_DE.md) for third-party dependencies and license information.
