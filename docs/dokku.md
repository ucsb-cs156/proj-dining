# docs/dokku.md

This page is not intended as full documentation of dokku setup; for that, please see: 

* <https://ucsb-cs156.github.io/topics/dokku/>

Instead, this is a quick guide to setting up a `proj-dining` 
instance on dokku that assumes you are already familiar with the basic operation of dokku, and just need a "cheat sheet" to 
get up and running quickly.

Throughout, we use `dining` as the appname.  Substitute any other appropriate name, e.g. `dining-qa`, `dining-dev-cgaucho`, `dining-pr235` as needed.

The lines in the instructions where you need to modify something are marked with the comment: `# modify this`

* For the values of `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` see [docs/oauth.md](https://github.com/ucsb-cs156/proj-dining/blob/main/docs/oauth.md)
* For the value of `UCSB_API_KEY` see: [UCSB Developer API overview](https://ucsb-cs156.github.io/topics/apis/apis_ucsb_developer_api.html)
* Set `SOURCE_REPO` to be the url of your teams' repo (i.e. replace the team name in the example below) 

The other line you can copy/paste as is, except for changing `dining` to whatever your app name will be (e.g. `dining-qa`, `dining-dev-cgaucho`, `dining-pr235`).

```
# Create app
dokku apps:create dining

# Create and link postgres database
dokku postgres:create dining-db
dokku postgres:link dining-db dining --no-restart

# Modify dokku settings
dokku git:set dining keep-git-dir true

# Set config vars
dokku config:set --no-restart dining PRODUCTION=true
dokku config:set --no-restart dining GOOGLE_CLIENT_ID=get-value-from-google-developer-console # modify this
dokku config:set --no-restart dining GOOGLE_CLIENT_SECRET=get-value-from-google-developer-console # modify this
dokku config:set --no-restart dining UCSB_API_KEY=get-from-developer.ucsb.edu  # modify this

# Set SOURCE_REPO to your repo (modify the url)
# This is for the link in the footer, and for the link to currently deployed branch in /api/systemInfo
dokku config:set --no-restart dining SOURCE_REPO=https://github.com/ucsb-cs156-s25/proj-dining-s25-xx 

# Set ADMIN_EMAILS to staff emails and team emails
dokku config:set --no-restart dining ADMIN_EMAILS=list-of-admin-emails # modify this

# Set MODERATOR_EMAILS to staff emails and team emails
dokku config:set --no-restart dining MODERATOR_EMAILS=list-of-moderator-emails # modify this

# git sync for first deploy (http)
dokku git:sync dining https://github.com/ucsb-cs156-s25/proj-dining-s25-xx main  # modify this 
dokku ps:rebuild dining

# Enable https
dokku letsencrypt:set dining email yourEmail@ucsb.edu # modify email
dokku letsencrypt:enable dining
```
