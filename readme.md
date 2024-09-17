# Flashcard

## The story

I recently attended IndiaFOSS 2024, a conference on open source software in India. I met a lot of people and when asked
to share contact, I saw a lot of folks sharing LinkedIn QR codes. LinkedIn is another proprietary platform that I don't
use. It would be rather nice to share a VCF file which can be imported into any phone.

For some reason, I did not find any simple tool which does this out of the box. So I decided to write one.

## Stack

Python server running Django. Postgres as the database & Chotu CSS for styling.

## Features

- Profile with name, email, phone, social media URLs, designation and company
- QR code for the profile
