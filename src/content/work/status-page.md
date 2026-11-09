---
title: Status page
kind: infra
order: 20
chip: Reliability · Rust
summary: Checks every minute · posts its own incidents
link: https://status.paperbase.me
story: true
result: null
---

## The problem

When something goes wrong, merchants need to know straight away whether it's their shop or the
platform, and an outage notice shouldn't depend on someone remembering to post it.

## What I built

A public status page for Paperbase, written in Rust with Axum and SQLite. It checks seven parts of the
platform every minute, posts an incident on its own when checks keep failing, and closes it again
when they recover. It backs itself up to Cloudflare R2 every night.

## The result

Anyone can see the platform's real state at any moment, without asking:
[status.paperbase.me](https://status.paperbase.me).

## Stack

Rust · Axum · SQLite · Cloudflare R2 backups
