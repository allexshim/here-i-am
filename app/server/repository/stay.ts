import { customAlphabet } from "nanoid";
import { query } from "../db/database.js";

const NANOID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// NOTE: 이 불편을 감수하며 camelCase를 쓸 메리트가 충분한가..?
export type Stay = {
  id: string;
  userId: string;
  city: string;
  country: string;
  startAt: string;
  endAt: string | null;
  expectedEndAt: string | null;
  comment: string | null;
  accommodation: string | null;
  lat: number | null;
  lng: number | null;
};

export type StayRow = {
  id: string;
  user_id: string;
  city: string;
  country: string;
  start_at: string;
  end_at: string | null;
  expected_end_at: string | null;
  comment: string | null;
  accommodation: string | null;
  lat: number | null;
  lng: number | null;
};

export type StayInput = {
  userId: string;
  city: string;
  country: string;
  startAt: string;
  endAt?: string | null;
  expectedEndAt?: string | null;
  comment?: string | null;
  accommodation?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type UpdateStayInput = Partial<
  Pick<
    Stay,
    | "city"
    | "country"
    | "startAt"
    | "endAt"
    | "expectedEndAt"
    | "comment"
    | "accommodation"
    | "lat"
    | "lng"
  >
>;

const stayColumnMap: Record<string, string> = {
  city: "city",
  country: "country",
  startAt: "start_at",
  endAt: "end_at",
  expectedEndAt: "expected_end_at",
  comment: "comment",
  accommodation: "accommodation",
  lat: "lat",
  lng: "lng",
};

function rowToStay(row: StayRow): Stay {
  return {
    ...row,
    userId: row.user_id,
    startAt: row.start_at,
    endAt: row.end_at,
    expectedEndAt: row.expected_end_at,
  };
}

export async function create({
  userId,
  city,
  country,
  startAt,
  endAt = null,
  expectedEndAt = null,
  comment = null,
  accommodation = null,
  lat = null,
  lng = null,
}: StayInput): Promise<Stay> {
  const id = customAlphabet(NANOID_ALPHABET, 12);
  const result = await query<StayRow>(
    `
    INSERT INTO stays (
      id, user_id, city, country, start_at, end_at, expected_end_at,
      comment, accommodation, lat, lng
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
    `,
    [
      id,
      userId,
      city,
      country,
      startAt,
      endAt,
      expectedEndAt,
      comment,
      accommodation,
      lat,
      lng,
    ],
  );
  return rowToStay(result.rows[0]);
}

export async function findAllByUserId(userId: string): Promise<Stay[]> {
  const result = await query<StayRow>(
    "SELECT * FROM stays WHERE user_id = $1 ORDER BY start_at ASC",
    [userId],
  );
  return result.rows.map(rowToStay);
}

export async function findOneByIdAndUserId(
  id: string,
  userId: string,
): Promise<Stay | undefined> {
  const result = await query<StayRow>(
    "SELECT * FROM stays WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  const row = result.rows[0];
  return row ? rowToStay(row) : undefined;
}

export async function remove(id: string, userId: string): Promise<number> {
  const result = await query(
    "DELETE FROM stays WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  return result.rowCount ?? 0; // should be 1
}

export async function update(
  id: string,
  userId: string,
  params: UpdateStayInput,
): Promise<number> {
  // params에서 실제로 넘어온 필드만 추출한다.
  const entries = Object.entries(params);
  if (entries.length == 0) return 0;

  let setClauses: string[] = [];
  let queryValues: (string | number | null)[] = [];
  let idx = 1;

  for (const [key, value] of entries) {
    setClauses.push(`${key} = $${idx}`);
    queryValues.push(value);
    idx++;
  }

  for (const [key, value] of entries) {
    setClauses.push(`${stayColumnMap[key]} = $${idx}`);
    queryValues.push(value);
    idx++;
  }

  queryValues.push(id, userId);
  const result = await query(
    `UPDATE stays SET ${setClauses.join(", ")} WHERE id = $${idx} AND user_id = $${idx + 1}`,
    queryValues,
  );

  return result.rowCount ?? 0; // should be 1
}
