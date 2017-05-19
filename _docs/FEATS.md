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
          `production-site, dr-site`
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

`@sprocket create vm` | `@sprocket new vm` :: `direct_message,direct_mention,mention`

*Example:*

```
user: @sprocket create vm
sprocket: I love creating new VMs! Let's do it!
sprocket: Which cluster should I create the VM on?
          `production-site, dr-site`
user: production-site
sprocket: What should we call the VM?
user: nagios-01
sprocket: How many vCPUs?
user: 2
sprocket: How much memory (in MB)?
user: 4096
sprocket: Should we add a disk or clone from image service?
user: add a disk
sprocket: How large should the disk be (in GB)?
user: 80
sprocket: Would you like to attach an ISO from the image service?
          `CentOS7, WindowsServer2012R2, UbuntuServer16.04`
user: UbuntuServer16.04
sprocket: What network should I attach to the VM?
          `VMnet, DMZnet, DEVnet, N/A`
user: VMnet
sprocket: I think I have everything I need, should I power on after creation?
user: yes
sprocket: One moment, while I create the VM.
sprocket: I have created the new VM (`nagios-01`) as you requested. It is currently powering up.
sprocket: /giphy power up
sprocket: `nagios-01` is powered up. IP address: `10.120.1.88`
```

`@sprocket delete vm` | `@sprocket blow away vm` :: `direct_message,direct_mention,mention`

*Example:*

```
user: @sprocket delete vm
sprocket: I can do that for you! What VM would you like to delete?
          app-01, app-02, app-03, db-01, db-02, lb-01, lb-02, nagios-01
user: nagios-01
sprocket: I never liked `nagios-01` anyway, it talks too much at parties. I am powering it down now.
sprocket: Are you sure you want to delete `nagios-01`?
user: yes
sprocket: Done. What a relief! Deleting that VM reclaimed 2vCPUs, 4096MB Memory and 32.5GB of storage.
sprocket: According to our xFit analytics, this lengthened your cluster runway by 11 days!
```
