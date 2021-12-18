import { Worker } from "worker_threads";
import { MSG_TYPE } from "./util.js";
import process from "process";

const N = 5;

const forks = Array(N).fill(true);
const philosophers = Array(N).fill(null).map((_, id) => new Worker("./src/philosopher.js", { workerData: { id } }));

const queue = [];

const messages = {
  [MSG_TYPE.ASK_FORK]: msg => {
    queue.push(msg);
    serve();
  },
  [MSG_TYPE.RELEASE_FORK]: msg => {
    const forkInd = forkId(msg.id)[msg.fork.left ? "left" : "right"];
    const fork = msg.fork.left ? { left: true } : { right: true };
    forks[forkInd] = true;
    serve();
    philosophers[msg.id].postMessage({ type: MSG_TYPE.FORK_RELEASED, fork });
  },
  [MSG_TYPE.STARVE_TO_DEATH]: () => process.exit(0),
};

function serve() {
  for (let i = 0; i < queue.length; i++) {
    const msg = queue[i];
    const id = msg.id;
    const prevId = id === 0 ? N - 1 : id - 1;
    const { left, right } = forkId(id);

    if ((hasNoForks(prevId) && msg.fork.left && forks[left])) {
      forks[left] = false;
      queue.splice(i, 1);
      i--;
      philosophers[id].postMessage({ type: MSG_TYPE.FORK_GIVEN, fork: { left: true } });
    } else if (msg.fork.right && forks[right]) {
      forks[right] = false;
      queue.splice(i, 1);
      i--;
      philosophers[id].postMessage({ type: MSG_TYPE.FORK_GIVEN, fork: { right: true } });
    }
  }
}

function forkId(id) {
  const left = id === 0 ? N - 1 : id - 1;
  return { left, right: id };
}

function hasNoForks(id) {
  const { left, right } = forkId(id);
  return forks[left] && forks[right];
}

philosophers.forEach(ph => ph.on("message", msg => messages[msg.type].call(null, msg)));
