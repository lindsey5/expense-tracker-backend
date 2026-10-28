# Backend repository guide

Before changing code, inspect the repository's manifests, configuration, entry points, and nearby examples. Identify the actual language, framework, persistence layer, test setup, and deployment path; do not infer them from a skill name.

Use the relevant .agents/skills/<skill-name>/SKILL.md for the task. Read only skills whose descriptions fit. Apply their workflows to the patterns and constraints found in this repository.

Keep validation at external boundaries, authorization on user-owned data, and coupled financial writes consistent when those concerns exist. Preserve existing error handling and public contracts. Never expose secrets or use an unconfirmed database or deployment target.

For code changes, find the repository's non-rewriting lint, test, and build commands in its manifests or CI files. Run the checks relevant to the change, note pre-existing failures, and inspect the final diff. For documentation-only changes, validate the edited documents and their references.
