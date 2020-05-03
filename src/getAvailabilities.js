import moment from "moment";
import knex from "knexClient";

// Helpers
const getHour = (date) => moment(date).format("h:mm");
const getDay = (date) => moment(date).format("dddd");

/*
 * weeklizeDate
 *
 * Build the week array from the provided input date and the 6 following days
 */
const weeklizeDate = (date) => {
  const week = [];
  let tmpDate = date;
  week.push({ day: getDay(date), date: tmpDate });

  for (let dayNb = 1; dayNb < 7; dayNb++) {
    const extraDay = new Date(moment(tmpDate).add(1, "days"));
    tmpDate = extraDay;
    week.push({ day: getDay(tmpDate), date: tmpDate });
  }

  return week;
};

/*
 * fillSlots
 *
 * Build slots array by filling 30-minutes spaced timeslot according an event start date.
 * Returns an array of object with the slots and their reference day to ease the search
 */

const fillSlots = (source) => {
  return source.map((event) => {
    const eventDay = getDay(event.starts_at);
    const slots = [];
    const startHour = moment(event.starts_at);
    const endHour = moment(event.ends_at);

    let slotHour = startHour;
    while (getHour(slotHour) !== getHour(endHour)) {
      slots.push(getHour(slotHour));
      slotHour = moment(slotHour).add(30, "m");
    }

    return { day: eventDay, slots };
  });
};

/*
 * getAvailableSlots
 *
 * Build the availability time slots array by diffing the openings' slots array with the appointments' one
 * Returns an array of all available slots with their reference day as key for array search purpose
 */
const substractSlots = (slot1, slot2) =>
  slot1.filter((hour) => !slot2.includes(hour));
// check return
// .concat(slot2.filter((hour) => !slot1.includes(hour)));

const getAvailableSlots = (openingsSlots, appointmentsSlots) =>
  openingsSlots.map(({ day, slots }) => {
    const correspondingAppointmentsSlots = appointmentsSlots.find(
      ({ day: apptmentday }) => apptmentday === day
    );
    const availableSlots = substractSlots(
      slots,
      correspondingAppointmentsSlots ? correspondingAppointmentsSlots.slots : []
    );

    return { day, slots: availableSlots };
  });

/*
 * getAvailableSlotsByDay
 *
 * Get the right slots for the input day
 */
const getAvailableSlotsByDay = (availableSlots, day) => {
  const daySlots = availableSlots.find(
    ({ day: availableDay }) => availableDay === day
  );
  return daySlots ? daySlots.slots : [];
};

export default async function getAvailabilities(date) {
  // Implement your algorithm here
  const week = weeklizeDate(date);

  const openings = await knex("events").where("kind", "opening");
  const appointments = await knex("events").where("kind", "appointment");

  const openingsSlots = fillSlots(openings);
  const appointmentsSlots = fillSlots(appointments);

  const availableSlots = getAvailableSlots(openingsSlots, appointmentsSlots);

  const availablities = week.map(({ day, date }) => ({
    date,
    slots: getAvailableSlotsByDay(availableSlots, day),
  }));

  return availablities;
}

export async function getAvailabilities2(date) {
  // Implement your algorithm here
  const week = weeklizeDate(date);

  const query = await knex("events")
    .where("starts_at", ">=", date)
    .where("starts_at", "<", moment(date).add(1, "weeks").toDate());
  console.log("test", query);

  const [openings, appointments] = query.reduce(
    (split, event) =>
      event.kind === "opening"
        ? [[...split[0], event], split[1]]
        : [split[0], [...split[1], event]],
    [[], []]
  );

  const openingsSlots = fillSlots(openings);
  const appointmentsSlots = fillSlots(appointments);

  const availableSlots = getAvailableSlots(openingsSlots, appointmentsSlots);

  const availablities = week.map(({ day, date }) => ({
    date,
    slots: getAvailableSlotsByDay(availableSlots, day),
  }));

  return availablities;
}
