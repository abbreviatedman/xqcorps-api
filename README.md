# xqcorps-api

An API for xqcorps.com, a collaborative storywriting app.

Endpoints: `GET /authors`, `/authors/:id`, `/authors/:id/stories`, `/stories`, `/stories/:id`, `/stories/:id/authors`.

Run `npm test`. Tests use `mongodb-memory-server` (downloads a mongod binary on first run), or set `TEST_MONGODB_URI` to use an existing MongoDB (its Author/Story data is deleted).