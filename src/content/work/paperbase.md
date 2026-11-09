---
title: Paperbase
kind: infra
order: 10
chip: Infrastructure
summary: Commerce platform · every shop, one system
link: null
story: true
result: null
---

## The problem

Online sellers in Bangladesh need a shop that works the way they sell: cash on delivery, and ads that
bring in real orders. Running a separate copy of the software
for every seller doesn't scale: every new shop means another setup, and every fix has to ship many
times.

## What I built

Paperbase, a multi-tenant commerce platform. One storefront engine serves every merchant, picking
the shop from the domain a visitor arrives on. Every shop gets automatic HTTPS, on its own domain too.

Ads are wired in properly: the Meta Pixel and the Conversions API report each purchase once, and
every shop chooses when it counts: as soon as the order is placed, or only after the seller confirms
the cash-on-delivery order, so the ad platforms can learn from real buyers instead of fake or
cancelled orders.

Before a parcel ships, the seller can check the buyer's delivery record across couriers: how many
of their parcels
were delivered and how many were cancelled.

The whole platform is self-hosted and run by me, on Hetzner with Coolify, Traefik, PostgreSQL, Redis
and Celery.

## The result

One system for every merchant: a fix or a new feature ships once and reaches every shop, and each
shop decides whether its ads learn from placed orders or only from confirmed ones.

## Stack

Python and Django · Celery · PostgreSQL · Redis · Traefik with automatic HTTPS · Docker and Coolify on
Hetzner · Meta Pixel and Conversions API
