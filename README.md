## Deadlock philosophers task

Five philosophers sit around a round table, with a plate in front of each philosopher.
Forks lie on the table between each pair of nearby philosophers.
Every philosopher can either eat or speculate (When they do one of these two processes, put the thread to sleep for a short time). Food intake is not limited in quantity - an infinite supply is implied.
A philosopher can only eat when he holds two forks - one taken from the right and the left.
Each philosopher can take the nearest fork (if available) or put down - if he is already holding it. Taking each fork and returning it to the table are separate actions that must be performed one after the other.
The question of the task is to develop a model of behavior (parallel algorithm) in which none of the philosophers will starve, that is, they will forever alternate between eating and thinking.
There should also be a fasting parameter, if the philosopher has not eaten for a long time, it is necessary to display a message about it.
As a conclusion of the results, you should show how many times each philosopher ate. 
