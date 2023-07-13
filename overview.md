# Bit Tasks for Azur DevOps Pipelines
Bit tasks for Git repositories supporting common CI/CD workflows.

## List of Tasks

### Bit Init

```
- task: bit-init@0
  inputs: # Optional
    wsdir: './'
```

### Bit Verify

```
- task: bit-verify@0
  inputs: # Optional (Default Bit Init `wsdir`)
    wsdir: './'
```

### Bit Tag-Export

```
- task: bit-tag-export@0
  inputs: # Optional (Default Bit Init `wsdir`)
    wsdir: './'
```

### Pull-Request (Coming Soon)

### Commit Bitmap (Coming Soon)