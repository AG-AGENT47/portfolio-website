# Hero gallery photos

Image files for the hero portrait gallery. Filenames here must match the `src`
paths in `src/lib/photos.ts`.

| File | Caption |
|------|---------|
| `big-sur-california.jpg` | Big Sur coastline (hero cover) |
| `aero-india-bangalore.jpg` | Formation flying at Aero India |
| `madison-transit.jpg` | Transit (portrait; orientation via EXIF) |
| `aurora-madison.jpg` | Aurora over the lake |
| `golden-hour-madison.jpg` | Golden hour |
| `star-trails.jpg` | Star trails |

If a file is missing the hero falls back to the striped placeholder and the
lightbox shows a "photo file not added yet" note.

## Adding / changing photos

1. Export JPEG, long edge 2400px, quality ~92 (e.g. `sips -Z 2400 -s format jpeg -s formatOptions 92 in --out out.jpg`).
2. Add or edit an entry in `PHOTOS` in `src/lib/photos.ts` with a matching
   `src`, real `alt` text, a `caption`, and an optional `meta` line.

v2: this list should move to a `photos` table in `portfolio-store`.
