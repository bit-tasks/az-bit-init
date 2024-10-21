# Bit Tasks for Azure DevOps Pipelines
Bit tasks for Git repositories supporting common CI/CD workflows.

Follow the below steps to install
1. Click [Get it free](https://marketplace.visualstudio.com/acquisition?itemName=bitdev.bit-tasks) link.
2. Next, you may need [relevant permission](https://learn.microsoft.com/en-us/azure/devops/marketplace/grant-permissions?view=azure-devops) to install the extension. For more information follow Azure DevOps guide [Install extensions](https://learn.microsoft.com/en-us/azure/devops/marketplace/install-extension?view=azure-devops&tabs=browser)
3. After installing you can select all Bit Tasks from the Tasks Assistant sidebar.
4. Ensure that all required variables are set.

## List of Tasks

### Pull-Request Build Example
Following pipeline task is used to verify the `Pull Requests`.

```
name: Bit PullRequest Build

pr:
  branches:
    include:
    - main

pool:
  vmImage: ubuntu-latest

variables:
  GIT_USER_NAME: $(GIT_USER_NAME)
  GIT_USER_EMAIL: $(GIT_USER_EMAIL)
  AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT) # Need git repository write permission
  BIT_CLOUD_ACCESS_TOKEN: $(secrets.BIT_CLOUD_ACCESS_TOKEN)

steps:
- task: bit-init@0
  inputs:
    wsdir: './' # Optional

- task: bit-pull-request@0
```

### Bit Tag-Export and Commit Back Example
Following pipeline task is used to Tag and Export Bit components after the `Pull Request` is merged and also `Commit` back the newest versions of the tagged components into the Git repository.

```
name: Tag and Export and Commit Back

trigger:
  branches:
    include:
    - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  GIT_USER_NAME: $(GIT_USER_NAME)
  GIT_USER_EMAIL: $(GIT_USER_EMAIL)
  AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT) # Need git repository write permission
  BIT_CLOUD_ACCESS_TOKEN: $(secrets.BIT_CLOUD_ACCESS_TOKEN)

steps:
- task: bit-init@0
  inputs:
    wsdir: './' # Optional

- task: bit-tag-export@0
  inputs:
    persist: 'false' # Optional: For soft tagging workflow use. It appends --persist flag to bit tag command

- task: bit-commit-bitmap@0
```

### Bit Verify (Optional)
Setup this task if you want to build Bit components in a particular branch
```
name: Bit Verify

trigger:
- my-branch

pool:
  vmImage: ubuntu-latest

variables:
  GIT_USER_NAME: $(GIT_USER_NAME)
  GIT_USER_EMAIL: $(GIT_USER_EMAIL)
  AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT) # Need git repository write permission
  BIT_CLOUD_ACCESS_TOKEN: $(secrets.BIT_CLOUD_ACCESS_TOKEN)

steps:
- task: bit-init@0
  inputs:
    wsdir: './' # Optional
- task: bit-verify@0
  inputs:
    skipbuild: 'false' # Optional
```

### Bit Branch Lane (Optional)
Setup this task if you want to create a Bit lane for each Git branch
```
name: Bit Branch Lane

trigger:
  branches:
    include:
      - '*'
    exclude:
      - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  GIT_USER_NAME: $(GIT_USER_NAME)
  GIT_USER_EMAIL: $(GIT_USER_EMAIL)
  AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT) # Need git repository write permission
  BIT_CLOUD_ACCESS_TOKEN: $(secrets.BIT_CLOUD_ACCESS_TOKEN)

steps:
- task: bit-init@0
  inputs:
    wsdir: './' # Optional
- task: bit-branch-lane@0
```

### Bit Lane Branch (Optional)
Setup this task if you want to create/update a Git branch based on the component changes on a given Bit lane
```
name: Bit Lane Branch

pool:
  vmImage: 'ubuntu-latest'

variables:
  GIT_USER_NAME: $(GIT_USER_NAME)
  GIT_USER_EMAIL: $(GIT_USER_EMAIL)
  AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT) # Need git repository write permission
  BIT_CLOUD_ACCESS_TOKEN: $(secrets.BIT_CLOUD_ACCESS_TOKEN)

steps:
- task: bit-init@0
  inputs:
    wsdir: './' # Optional
- task: bit-lane-branch@0
  inputs:
    lanename: 'my-lane-name' # Required
    branchname: 'my-branch-name' # Optional
    skippush: 'false' # Optional
```

### Bit Lane Cleanup (Optional)
Setup this task if you want delete or archive a Bit lane. This is typically useful to delete or archive Bit lanes created by the `pull-request` task.
```
name: Bit Lane Cleanup

pool:
  vmImage: 'ubuntu-latest'

variables:
  GIT_USER_NAME: $(GIT_USER_NAME)
  GIT_USER_EMAIL: $(GIT_USER_EMAIL)
  AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT) # Need git repository write permission
  BIT_CLOUD_ACCESS_TOKEN: $(secrets.BIT_CLOUD_ACCESS_TOKEN)

steps:
- task: bit-init@0
  inputs:
    wsdir: './' # Optional: The working directory for your Bit workspace

- task: bit-lane-cleanup@0
  inputs:
    archive: 'false' # Optional: Specify if lanes should be archived instead of deleted (true/false)
```

### Bit Dependency Update (Optional)
Setup this task if you want to update component and package versions automatically

```
name: Bit Dependency Update

pool:
  vmImage: 'ubuntu-latest'

variables:
  GIT_USER_NAME: $(GIT_USER_NAME)
  GIT_USER_EMAIL: $(GIT_USER_EMAIL)
  AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT) # Need git repository write permission
  BIT_CLOUD_ACCESS_TOKEN: $(secrets.BIT_CLOUD_ACCESS_TOKEN)

steps:
- task: bit-init@0
  inputs:
    wsdir: './' # Optional: The working directory for your Bit workspace. Default: 'Dir specified in Init Task or ./'

- task: bit-dependency-update@0
  inputs:
    wsdir: './' # Optional: The working directory for your Bit workspace. Default: 'Dir specified in Init Task or ./'
    allow: 'all' # Optional: Allow different types of dependency updates. Comma-separated options. Default: 'all'. Options: 'external-dependencies', 'workspace-components', 'envs', 'all'
    version-update-policy: '' # Optional: Defines the version update policy. Default: ''. Options: 'semver', 'minor', 'patch'
    package-patterns: '' # Optional: A string list of package names or patterns, separated by spaces or commas. Default: All packages are selected
    component-patterns: '' # Optional: A string list of component names or patterns, separated by spaces or commas. Default: All components are selected
    env-patterns: '' # Optional: A string list of environment names or patterns, separated by spaces or commas. Default: All environments are selected
```