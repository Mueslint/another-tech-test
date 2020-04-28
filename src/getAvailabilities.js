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

export default async function getAvailabilities(date) {
  // Implement your algorithm here
  const week = weeklizeDate(date);

  const availablities = week.map((weekDay) => ({ date: weekDay, slots: [] }));
  const openings = await knex("events").where("kind", "opening");

  // const appointmentsDate = await knex("events")
  //   .where("kind", "appointment")
  //   .select("starts_at")
  //   .map((appointment) => formatDate(appointment.starts_at));

  // console.log(appointmentsDate);
  // const weeklyOpenings = openings.filter((opening) => opening.weekly_recurring);

  return availablities;
}
