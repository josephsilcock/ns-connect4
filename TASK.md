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
- `prisma/contract.prisma` — the Prisma schema, and the single source of truth
  for your database. It currently declares only the datasource (PostgreSQL) and
  the client generator; the models describing your tables are yours to add.

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

Below are some extra tasks. Pick and choose any that seem interesting to you.

---

### Extra: Build a stats page

#### Background

We have saved the game results in the database, but have no way of seeing them other than going into the database. Add 
a page for game statistics.

#### Task

- Read the saved games back out of the database and show them.
- Think about what stats you might want to show, and the best way to show them.

#### Acceptance criteria

- As a player, I can see the results of previous games on the stats page

---

### Extra: Add usernames

#### Background

Games are currently recorded against player *numbers* — player 1 beat player 2.
That tells you nothing a week later, because player 1 is a different person
every game. To make the stats page mean anything, we need to know who was
actually playing.

#### Task

- Let players enter their names before a game starts, and show those names
  during play instead of "Player 1" / "Player 2".
- Store the names with the result, and use them on the stats page.

The interesting decision is how to model this:

1. Put the names straight on the game row as two strings — quick, but
   "Joe", "joe" and "Joe " become three different people, and renaming someone
   means rewriting every one of their games.
2. Give players their own table and have each game *reference* two of them — a
   [relation](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations).
   More schema work, but each player exists once and the database itself
   enforces that a game cannot point at a player who does not exist.

Pick one, and be able to justify it to your trainer. If you go with option 2,
look at how `include`/`select` fetch a game together with its players, and how
`upsert` lets you reuse an existing player or create them on first sight.

Remember you are changing a schema that already has data in it: run
`npm run db:migrate` and read the migration it generates before applying it.
What happens to the games you saved in task 4?

#### Acceptance criteria

- As a player, I can enter my name before playing
- As a player, I can see my name rather than "Player 1" while playing
- As a player, the stats page shows who won by name
- The same person playing twice is recognised as one player, not two

---

### Extra: Move history, undo and replay

#### Background

The controller keeps the board and nothing else, so the game has no memory of
how it got there. A misclick is final, and a finished game leaves behind only a
winner.

If you instead keep the *list of moves*, the board stops being the source of
truth and becomes something you derive from that list. That one change buys you
undo, replay, and a game you can store far more interestingly in the database.

#### Task

- Record each move as it is played, and expose the history on `GameStatus`.
- Add an undo button that takes back the last move and returns the turn to the
  player who made it.
- Show the move list, or at least the move number, alongside the board.

Things to think about:

- Do you replay the whole history to rebuild the board, or keep the board *and*
  the history in step as you go? The first is harder to get wrong; the second is
  faster. Which matters at a 7x6 board?
- Undo has to unwind the win/draw state too — taking back the winning move
  should put the game back to `ongoing`.
- Your existing controller tests place moves one at a time. Can a test now set
  up a whole position from a list of columns instead? That tends to make the
  win-condition tests much easier to read.

If you have done task 4, save the move list with the completed game — a Connect
4 game is at most 42 small integers. Then the stats page can step through a
finished game move by move. Note the modelling choice: one row per move in its
own table, or the whole sequence on the game row as a string or array? What can
you query with the first that you cannot with the second?

#### Acceptance criteria

- As a player, I can undo my last move
- As a player, undoing the winning move puts the game back into play
- The board and the current player are always consistent with the move history
- Unit tests cover undoing from a won, drawn and ongoing game

---

### Extra: Play against the computer

#### Background

The game is pass-and-play, so you need a second person in the room. Let's give
players an opponent that is always available.

This one is pure algorithm work — no new infrastructure, no new dependencies. It
also puts your controller under real pressure: to search ahead, the computer has
to try a move, look at the result, and take it back again, thousands of times.

#### Task

- Let a player choose to play against the computer, and which colour they are.
- Implement the opponent, starting simple and working up:
  1. Play a random legal column. Gets the plumbing working end to end.
  2. Win if you can this turn; block the opponent if they can win next turn.
  3. Search ahead properly with
     [minimax](https://en.wikipedia.org/wiki/Minimax), to a fixed depth, scoring
     the positions you cannot search past.

Things to think about:

- Searching means trying a move and undoing it. Does your controller let you do
  that, or does it only ever move forwards? This is the same problem the move
  history task solves — and a good reason to do that one first.
- A win found in two moves is worth more than the same win in six. How does your
  score reflect that?
- Minimax explores positions it cannot possibly need. Look up
  [alpha-beta pruning](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning)
  and measure the difference — how much deeper can you search in the same time?
- The search runs on the main thread and will block the UI. What depth stays
  comfortable? What does the board do while the computer is thinking?

#### Acceptance criteria

- As a player, I can play a full game against the computer
- The computer takes a win when one is available, and blocks an obvious loss
- The computer never plays an illegal move, and never plays out of turn
- The UI stays responsive, and shows that the computer is thinking

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
