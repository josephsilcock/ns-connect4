# Task

## Learning Objectives

- React/NextJS
- Databases
- Object-relational mappers (ORMs)
- Docker (briefly)

## Tasks

### 1. Implement making a move

#### Background

The Connect 4 grid doesn’t input new tokens as it stands. From the code, you can see we have a grid which

#### Task

- Validate column input
- Find the lowest row
- Place a counter
- Change player
- Add unit tests

#### Acceptance criteria

- Users can place a counter in the connect 4 grid
- Users cannot place it outside of the grid
- Users cannot place it on a full column
- Player switches once a token is played

#### Extra

Why do we want to have the useState hook for gameStatus?

---

### 2. Create a win condition

#### Background

As it stands, the user can place tokens into the connect 4 grid, but cannot win! This is a little Leetcode-esque, but I would like for you to make a method which checks for a win and a draw!

#### Task

- Create a method of a user winning or drawing
- Use GameStatus to display a winning/ draw message

#### Acceptance criteria

- As a player, I must be able to win by connecting 4 tokens in a row
- As a player, I must be able to draw if my competitor and I cannot win
- As a player, I should be able to see a message based on the win/ draw

---

### 3. Create a reset button

#### Background

We currently have a game, but no way of simply restarting it without refreshing the page.

#### Task

- Add a React component, allowing us to restart the game

#### Acceptance criteria

- Users can restart games without needing to refresh the page

---

### 4. Update the database with scores

#### Background

Finished games currently go nowhere. There is a `POST /api/games` endpoint in
[`app/api/games/route.ts`](./app/api/games/route.ts), but it is not finished yet.

We are using an ORM called [Prisma](https://www.prisma.io/docs) to work with the database. An ORM (Object-Relational 
Mapping) is a tool that allows us to use the language we are coding in (in this case Typescript) to work with the database.
This means we can separate raw SQL out of our code.

What is already provided for you:

- `compose.yaml` — PostgreSQL 18 running locally in Docker, so there is nothing
  to install by hand. The container creates the `connect4` database on first
  start using the same credentials as in `.env.example`, and keeps its data in a named
  Docker volume so it survives restarts.
- `app/lib/prisma.ts` — a Prisma client singleton, so Next's dev-mode hot
  reloading doesn't open a new connection pool on every edit.
- `prisma/contract.prisma` - 

| Command                  | What it does                                    |
| ------------------------ | ----------------------------------------------- |
| `npm run db:up`          | Start PostgreSQL 18 in the background           |
| `npm run db:down`        | Stop and remove the container, keeping the data |
| `npm run db:generate`    | Generate the Prisma client from the schema      |
| `npm run db:migrate`     | Create/apply the Prisma migrations              |
| `docker compose down -v` | Stop the container **and delete all data**      |

#### Task

Read up on how the ORM works as you go ([Core concepts](https://www.prisma.io/docs/orm/core-concepts))

1. Create your `.env` and start the database:

   ```bash
   cp .env.example .env
   npm run db:up
   ```

   The `DATABASE_URL` in `.env.example` already matches the container, so there
   is nothing to edit.

2. Update the code to persist the game results in this database. You will need to:
   1. Update the database schema in `contract.prisma`. Once you have done this, you will need to run

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   `db:migrate` will ask you to name the migration (e.g. `init`) and will write
   it to `prisma/migrations/`. Commit that folder — migrations are part of the
   codebase.

   2. Update the endpoint to insert data into the database.

3. Use a SQL select to check the row really landed after finishing a game:
   1. I like to use the database UI within IntelliJ
   2. You can also use a tool like [PgAdmin](https://www.pgadmin.org/)

#### Acceptance criteria

- As a player, completed games automatically get uploaded to the database

---

### Extra: Enable online multiplayer with Redis

#### Background

We have a fully-functioning game whereby players can “pass-and-play”. This is all very cool, but let’s say the client wants to go further. They might like the idea of playing each other at the same time.

How is this possible? At the moment, the state of the game is stored in the browser (`gameStatus`). This won’t do, since we’re trying to let separate browsers/ machines play the same game.

We _could_ store the state in our database in a table… or we could go for gold. It is possible to use an in-memory database like Redis and web sockets to play at the same time.

#### Task

- Using AI tools to help you, look for a way to connect players over Redis.
- You can run redis locally for development & the free tier in Redis Cloud to play online. Do _not_ use Redis Upstash, since it has no free tier. NextJS isn't designed for continuous connections, however

Suggestion:

1. You can start by modifying the initial game to just POST and stream the entire GameStatus.
2. Then, you can move controller logic into the POST endpoint, so you only post the move
3. Finally, you can implement multi-player

Create an HLD to explain your proposed approach to your trainer

#### Acceptance criteria

- A player can create a game
- Another player can join a game
- Games can be played like normal
