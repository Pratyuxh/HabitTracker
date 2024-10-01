const router = require('express').Router();
const Habit = require('../models/habitModel');

// Get Habits From Database
router.get('/', (req, resp) => {
    Habit.find().select('-updatedAt -createdAt -__v').sort({ _id: -1 })
        .then(habits => {
            var days = [];
            days.push(getD(0));
            days.push(getD(1));
            days.push(getD(2));
            days.push(getD(3));
            days.push(getD(4));
            days.push(getD(5));
            days.push(getD(6));
            resp.render('habit', { habit: habits, days });
        })
        .catch(err => {
            console.log(err);
        });
});

// Find the Date and Return the string Date
function getD(n) {
    let d = new Date();
    d.setDate(d.getDate() + n);
    var newDate = d.toLocaleDateString('pt-br').split('/').reverse().join('-');
    var day;
    switch (d.getDay()) {
        case 0: day = 'Sun'; break;
        case 1: day = 'Mon'; break;
        case 2: day = 'Tue'; break;
        case 3: day = 'Wed'; break;
        case 4: day = 'Thu'; break;
        case 5: day = 'Fri'; break;
        case 6: day = 'Sat'; break;
    }
    return { date: newDate, day };
}

// Create a New Habit or Update Existing Habit
router.post('/habit', async (req, resp) => {
    const { content } = req.body;
    console.log(content);

    Habit.findOne({ content: content }).then(habit => {
        let tzoffset = (new Date()).getTimezoneOffset() * 60000;
        var today = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);

        if (habit) {
            // Update Existing Habit Status
            let dates = habit.dates;
            let found = dates.some(item => item.date === today);

            if (!found) {
                dates.push({ date: today, complete: 'none' });
                habit.dates = dates;
                habit.save()
                    .then(habit => {
                        console.log(habit);
                        resp.redirect('back');
                    })
                    .catch(err => console.log(err));
            } else {
                console.log("Habit already inserted in the database");
                resp.redirect('back');
            }
        } else {
            // Create a new habit
            let dates = [];
            dates.push({ date: today, complete: 'none' });
            const newHabit = new Habit({
                content,
                dates,
            });

            newHabit
                .save()
                .then(habit => {
                    console.log(habit);
                    resp.redirect('back');
                })
                .catch(err => console.log(err));
        }
    });
});

// Habit Status Update per Days with Streak Calculation
router.get("/habitStatus", (req, resp) => {
    var d = req.query.date;
    var id = req.query.id;
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    let today = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
    let yesterday = (new Date(Date.now() - tzoffset - 86400000)).toISOString().slice(0, 10); // 1 day earlier

    Habit.findById(id)
        .then(habit => {
            let dates = habit.dates;
            let found = false;
            let streak = habit.streak;

            dates.find(function (item, index) {
                if (item.date === d) {
                    if (item.complete === 'yes') {
                        item.complete = 'no';
                        // Reset streak if the user unmarks the habit
                        habit.streak = 0;
                    } else if (item.complete === 'no' || item.complete === 'none') {
                        item.complete = 'yes';

                        // Check if yesterday's habit is completed
                        const yesterdayHabit = dates.find(h => h.date === yesterday && h.complete === 'yes');
                        if (yesterdayHabit) {
                            // Increment streak if yesterday's habit is completed
                            habit.streak += 1;
                        } else {
                            // Reset streak if there was a gap in continuity
                            habit.streak = 1;
                        }
                    }
                    found = true;
                }
            });

            if (!found) {
                dates.push({ date: d, complete: 'yes' });
                // Start a new streak if this is the first time marking the habit
                habit.streak = 1;
            }
            habit.dates = dates;
            return habit.save();
        })
        .then(updatedHabit => {
            console.log("Updated Habit:", updatedHabit);
            resp.redirect('back');
        })
        .catch(err => {
            console.log("Error updating habit status", err);
            resp.status(500).send("Error updating habit status");
        });
});

// Delete Habit
router.get("/:id", async (req, resp) => {
    const documentProduct = await Habit.findOneAndRemove({ _id: req.params.id });
    if (!documentProduct) {
        resp.status(500).json(err);
    }
    resp.redirect('/');
});

module.exports = router;
