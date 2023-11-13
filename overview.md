# Bit Tasks for Azure DevOps Pipelines
Bit tasks for Git repositories supporting common CI/CD workflows.

## List of Tasks

### Bit Init

```
trigger:
- main

pool:
  vmImage: ubuntu-latest

variables:
  GIT_USER_NAME: ${{ secrets.GIT_USER_NAME }}
  GIT_USER_EMAIL: ${{ secrets.GIT_USER_EMAIL }}
  BIT_CLOUD_ACCESS_TOKEN: ${{ secrets.BIT_CLOUD_ACCESS_TOKEN }} # Either BIT_CLOUD_ACCESS_TOKEN or BIT_CONFIG_USER_TOKEN is needed. Not both.
  BIT_CONFIG_USER_TOKEN: ${{ secrets.BIT_CONFIG_USER_TOKEN }}

steps:
- task: bit-init@0
  inputs:
    wsdir: './' # Optional
```

### Bit Verify

```
- task: bit-verify@0
  inputs: 
    wsdir: './' # Optional (Default Bit Init `wsdir`)
```

### Bit Tag-Export

```
- task: bit-tag-export@0
  inputs: 
    wsdir: './' # Optional (Default Bit Init `wsdir`)
```

### Pull-Request

```
- task: bit-pull-request@0
  inputs: 
    wsdir: './' # Optional (Default Bit Init `wsdir`)
```

### Commit Bitmap

```
- task: bit-commit-bitmap@0
  inputs: 
    wsdir: './' # Optional (Default Bit Init `wsdir`)
    gitusername: '<GIT USER NAME> # Required Github user name to commit back .bitmap file to the repository.
    gituseremail: '<GIT USER EMAIL> # Required Github user email to commit back .bitmap file to the repository.
```

### Branch-Lane

```
- task: bit-branch-lane@0
  inputs:
    wsdir: './' # Optional (Default Bit Init `wsdir`)
```

### Dependency-Update

```
- task: bit-dependency-update@0
  inputs:
    wsdir: './' # Optional (Default Bit Init `wsdir`)
    allow: 'all' # Optional (Default `all`) Allow different types of dependencies. Options `all`, `external-dependencies`, `workspace-components`, envs. You can also use a combination of one or two values, e.g. external-dependencies, workspace-components.
    branch: 'main' # Optional (Default `main`) Branch to check for dependency updates.
    gitusername: '<GIT USER NAME> # Required Github user name to commit back .bitmap file to the repository.
    gituseremail: '<GIT USER EMAIL> # Required Github user email to commit back .bitmap file to the repository.

```