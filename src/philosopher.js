import { workerData, parentPort } from "worker_threads";
import { MSG_TYPE } from "./util.js";

const { id } = workerData;
const forks = { left: false, right: false };
let hunger = 100;

const sleep = () => Math.floor(Math.random() * (5000 - 1000) + 1000);
const log = (msg) => console.log(`Philosopher ${id} ${msg}`);

log("Was born");

setInterval(() => {
  hunger -= 5;
  if (hunger <= 0) {
    console.log(`Philosopher ${id} has starved to death`);
    parentPort.postMessage({ type: MSG_TYPE.STARVE_TO_DEATH });
  }
}, 1000);

async function eat() {
  return new Promise(resolve => setTimeout(() => {
    hunger = 100;
    log("Ate, hunger: " + hunger);
    resolve();
  }, sleep()));
}

async function think() {
  const initHunger = hunger;
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (100 * (1 - hunger / initHunger) > 10) {
        log("Thought, hunger: " + hunger);
        clearInterval(interval);
        resolve();
      }
    }, 500);
  });
}

const { askFork, releaseFork } = (function () {
  const subscribers = new Set();
  parentPort.on("message", msg => subscribers.forEach(sub => sub.call(null, msg)));

  const askFork = () => {
    if (!forks.left) parentPort.postMessage({ type: MSG_TYPE.ASK_FORK, id, hunger, fork: { left: true } });
    else if (!forks.right) parentPort.postMessage({ type: MSG_TYPE.ASK_FORK, id, hunger, fork: { right: true } });
    else return Promise.resolve();

    return new Promise(resolve => {
      const cb = msg => {
        if (msg.type === MSG_TYPE.FORK_GIVEN) {
          subscribers.delete(cb);
          if (msg.fork.left) forks.left = true;
          else forks.right = true;
          log(`Got ${msg.fork.left ? "left" : "right"} fork`);
          resolve();
        }
      };

      subscribers.add(cb);
    });
  };

  const releaseFork = () => {
    if (forks.left) parentPort.postMessage({ type: MSG_TYPE.RELEASE_FORK, id, fork: { left: true } });
    else if (forks.right) parentPort.postMessage({ type: MSG_TYPE.RELEASE_FORK, id, fork: { right: true } });
    else return Promise.resolve();

    return new Promise(resolve => {
      const cb = msg => {
        if (msg.type === MSG_TYPE.FORK_RELEASED) {
          subscribers.delete(cb);
          if (msg.fork.left) forks.left = false;
          else forks.right = false;
          log(`Released ${msg.fork.left ? "left" : "right"} fork`);
          resolve();
        }
      };

      subscribers.add(cb);
    });
  };

  return { askFork, releaseFork };
})();

async function* act() {
  while (true) {
    yield await askFork().then(askFork).then(eat).then(releaseFork).then(releaseFork).then(think);
  }
}

for await (const _ of act()) {
  // act infinitely
}
