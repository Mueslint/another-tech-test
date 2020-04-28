import moment from "moment";
import knex from "knexClient";

const weeklizeDate = (date) => {
  const week = [];
  let tmpDate = date;
  week.push(tmpDate);

  for (let dayNb = 1; dayNb < 7; dayNb++) {
    const extraDay = new Date(moment(tmpDate).add(1, "days"));
    tmpDate = extraDay;
    week.push(extraDay);
  }

  return week;
};

const logDate = (date, format) => console.log(moment(date).format(format));
const hourFormatted = (date) => moment(date).format("h:mm");

const fillOpeningsSlots = (week, openings) => {
  return openings.map((opening) => {
    const slots = [];
    const startHour = moment(opening.starts_at);
    const endHour = moment(opening.ends_at);

    let slotHour = startHour;
    while (hourFormatted(slotHour) !== hourFormatted(endHour)) {
      slots.push(hourFormatted(slotHour));
      slotHour = moment(slotHour).add(30, "m");
    }
    slots.push(hourFormatted(endHour));

    return slots;
  });
};

export default async function getAvailabilities(date) {
  // Implement your algorithm here
  const week = weeklizeDate(date);

  const availablities = week.map((weekDay) => ({ date: weekDay, slots: [] }));
  const openings = await knex("events").where("kind", "opening");
  const appointments = await knex("events").where("kind", "appointment");
  const slots = fillOpeningsSlots(week, openings, appointments);
  console.log(slots.flat());
  // console.log(appointmentsDate);
  // const weeklyOpenings = openings.filter((opening) => opening.weekly_recurring);

  return availablities;
}
