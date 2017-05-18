# @sprocket FEATS

Below is an attempt at describing the current features of the slackbot. The format below will show all of the commands that the bot listens for and in what context.

## Implemented Commands/Logic

These commands are implemented in the slackbot, in any form. They will be continuously improved over time.

N/A

## Implementation in Progress

These commands are currently being developed and are in testing.

### `/vms/`

`@sprocket get vms` | `@sprocket list vms` :: `direct_message,direct_mention,mention`

*Example:*

```
user: @sprocket get vms
sprocket: There are 2 registered clusters, which cluster would you like to query?
          production-site, dr-site
user: production-site
sprocket: These are the running VMs in the production-site cluster:
          app-01, app-02, app-03, db-01, db-02, lb-01, lb-02
sprocket: Would you like to see powered off VMs as well?
user: no
sprocket: Ok!
```

`@sprocket poweroff vm` | `@sprocket shutdown vm` :: `direct_message,direct_mention,mention`

*Example:*

```
user: @sprocket poweroff vm
sprocket: Which VM would you like to Power Off?
user: app-02 in production-site
sprocket: `app-02` has been powered off in the production-site.
```
