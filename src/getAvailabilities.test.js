import knex from "knexClient";
import getAvailabilities, { getAvailabilities2 } from "./getAvailabilities";

describe("getAvailabilities", () => {
  beforeEach(() => knex("events").truncate());

  describe("simple case", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 12:30"),
          weekly_recurring: true,
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30"),
        },
      ]);
    });
    it("should fetch availabilities correctly", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );

      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );

      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00",
      ]);

      expect(availabilities[2].slots).toEqual([]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });
  });

  describe("less simpler case", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 12:30"),
          weekly_recurring: true,
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-13 2:00"),
          ends_at: new Date("2014-08-13 4:00"),
          weekly_recurring: true,
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-14 09:30"),
          ends_at: new Date("2014-08-14 12:30"),
          weekly_recurring: true,
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30"),
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-12 10:30"),
          ends_at: new Date("2014-08-12 11:30"),
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-13 2:30"),
          ends_at: new Date("2014-08-13 3:30"),
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-14 10:30"),
          ends_at: new Date("2014-08-14 11:30"),
        },
      ]);
    });
    it("should fetch availabilities correctly", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );

      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );

      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00",
      ]);

      expect(availabilities[2].slots).toEqual([]);

      expect(String(availabilities[3].date)).toBe(
        String(new Date("2014-08-13"))
      );

      expect(availabilities[3].slots).toEqual(["2:00", "3:30"]);

      expect(String(availabilities[4].date)).toBe(
        String(new Date("2014-08-14"))
      );

      expect(availabilities[4].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00",
      ]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });
  });

  describe("not recurrent days", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "opening",
          starts_at: new Date("2014-08-10 09:30"),
          ends_at: new Date("2014-08-10 12:30"),
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-11 2:00"),
          ends_at: new Date("2014-08-05 4:00"),
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 2:30"),
          ends_at: new Date("2014-08-11 3:30"),
        },
      ]);
    });

    it("should fetch availabilities correctly", async () => {
      const availabilities = await getAvailabilities2(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);
      expect(availabilities[0].slots).toEqual([
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
      ]);

      expect(availabilities[1].slots).toEqual(["2:00", "3:30"]);
    });
  });

  describe("no event", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 12:30"),
          weekly_recurring: true,
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-19 10:30"),
          ends_at: new Date("2014-08-19 11:30"),
        },
      ]);
    });
    it("should fetch availabilities correctly", async () => {
      const availabilities = await getAvailabilities2(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );

      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );

      expect(availabilities[1].slots).toEqual([]);

      expect(availabilities[2].slots).toEqual([]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });
  });

  describe("full event", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 10:30"),
          weekly_recurring: true,
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-04 9:30"),
          ends_at: new Date("2014-08-04 10:30"),
        },
      ]);
    });
    it("should fetch availabilities correctly", async () => {
      const availabilities = await getAvailabilities2(new Date("2014-08-04"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-04"))
      );

      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-05"))
      );

      expect(availabilities[1].slots).toEqual([]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-10"))
      );
    });
  });
});
