import { DataSource } from 'typeorm';

const SALES_PERSON_IDS = [
  '75bd1a47-62e9-40a4-b1f1-00b474442512',
  '5b38f2ee-ac4c-40fd-ab52-b917ab456f5b',
];

const CAR_COUNT = 40;
const IMAGES_PER_CAR = 3;
const REFERENCE_YEAR = new Date().getFullYear();
const VIN_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';

interface CarTemplate {
  brand: string;
  model: string;
  basePrice: number;
}

interface SalesPerson {
  id: string;
  name: string;
  roles: string[];
}

const CAR_CATALOG: CarTemplate[] = [
  { brand: 'Toyota', model: 'Corolla', basePrice: 22000 },
  { brand: 'Toyota', model: 'Camry', basePrice: 28000 },
  { brand: 'Toyota', model: 'RAV4', basePrice: 30000 },
  { brand: 'Toyota', model: 'Tacoma', basePrice: 35000 },
  { brand: 'Toyota', model: 'Highlander', basePrice: 40000 },
  { brand: 'Honda', model: 'Civic', basePrice: 24000 },
  { brand: 'Honda', model: 'Accord', basePrice: 28000 },
  { brand: 'Honda', model: 'CR-V', basePrice: 30000 },
  { brand: 'Honda', model: 'Pilot', basePrice: 40000 },
  { brand: 'Ford', model: 'F-150', basePrice: 40000 },
  { brand: 'Ford', model: 'Mustang', basePrice: 32000 },
  { brand: 'Ford', model: 'Explorer', basePrice: 38000 },
  { brand: 'Ford', model: 'Bronco', basePrice: 40000 },
  { brand: 'Chevrolet', model: 'Silverado', basePrice: 42000 },
  { brand: 'Chevrolet', model: 'Tahoe', basePrice: 55000 },
  { brand: 'Chevrolet', model: 'Camaro', basePrice: 30000 },
  { brand: 'Chevrolet', model: 'Equinox', basePrice: 28000 },
  { brand: 'Tesla', model: 'Model 3', basePrice: 40000 },
  { brand: 'Tesla', model: 'Model Y', basePrice: 45000 },
  { brand: 'Tesla', model: 'Model S', basePrice: 80000 },
  { brand: 'BMW', model: '3 Series', basePrice: 45000 },
  { brand: 'BMW', model: '5 Series', basePrice: 58000 },
  { brand: 'BMW', model: 'X5', basePrice: 66000 },
  { brand: 'BMW', model: 'M4', basePrice: 80000 },
  { brand: 'Mercedes-Benz', model: 'C-Class', basePrice: 47000 },
  { brand: 'Mercedes-Benz', model: 'E-Class', basePrice: 60000 },
  { brand: 'Mercedes-Benz', model: 'GLE', basePrice: 62000 },
  { brand: 'Mercedes-Benz', model: 'S-Class', basePrice: 115000 },
  { brand: 'Audi', model: 'A4', basePrice: 42000 },
  { brand: 'Audi', model: 'Q5', basePrice: 50000 },
  { brand: 'Audi', model: 'Q7', basePrice: 60000 },
  { brand: 'Lexus', model: 'RX', basePrice: 50000 },
  { brand: 'Lexus', model: 'ES', basePrice: 43000 },
  { brand: 'Lexus', model: 'GX', basePrice: 65000 },
  { brand: 'Hyundai', model: 'Elantra', basePrice: 22000 },
  { brand: 'Hyundai', model: 'Tucson', basePrice: 28000 },
  { brand: 'Hyundai', model: 'Palisade', basePrice: 40000 },
  { brand: 'Kia', model: 'Telluride', basePrice: 40000 },
  { brand: 'Kia', model: 'Sportage', basePrice: 28000 },
  { brand: 'Nissan', model: 'Altima', basePrice: 27000 },
  { brand: 'Nissan', model: 'Rogue', basePrice: 29000 },
  { brand: 'Subaru', model: 'Outback', basePrice: 30000 },
  { brand: 'Subaru', model: 'Forester', basePrice: 28000 },
  { brand: 'Mazda', model: 'CX-5', basePrice: 29000 },
  { brand: 'Mazda', model: 'Mazda3', basePrice: 24000 },
  { brand: 'Volkswagen', model: 'Golf GTI', basePrice: 32000 },
  { brand: 'Volkswagen', model: 'Tiguan', basePrice: 30000 },
  { brand: 'Jeep', model: 'Wrangler', basePrice: 38000 },
  { brand: 'Jeep', model: 'Grand Cherokee', basePrice: 42000 },
  { brand: 'Porsche', model: '911', basePrice: 115000 },
  { brand: 'Porsche', model: 'Macan', basePrice: 60000 },
  { brand: 'Volvo', model: 'XC90', basePrice: 58000 },
  { brand: 'Land Rover', model: 'Range Rover Sport', basePrice: 85000 },
  { brand: 'Cadillac', model: 'Escalade', basePrice: 85000 },
];

const PEXELS_PHOTO_IDS = [
  97353, 99435, 100650, 100656, 108152, 110844, 164634, 169176, 258084, 261985,
  285440, 452099, 498703, 575386, 831475, 919073, 937668, 1015555, 1213294,
  1729993, 2036544, 2475808, 2631489, 3002139, 3007435, 3264504, 3729464,
  3752194, 3786091, 3786092, 4062326, 4157182, 4195845, 4257579, 4639907,
  4678065, 4829621, 4913911, 4928613, 5054159, 5054166, 5125104, 5201073,
  5229533, 5330288, 5410923, 5488732, 5516033, 5570662, 5589339, 5591139,
  5640510, 5660747, 5731332, 5864402, 5896401, 6335964, 6502400, 6563903,
  6698127, 6706311, 6862165, 6940962, 6954698, 7049365, 7154537, 7454716,
  7873720, 7903330, 7959154, 7980873, 7980888, 8316482, 8335100, 8343503,
  8425057, 8498039, 8561771, 8586689, 8687562, 9018708, 9145483, 9282736,
  9301046, 9320072, 9347162, 9460402, 9460614, 9529407, 9636349, 9670186,
  9695615, 9704513, 9714430, 9732653, 9737318, 9799738, 9799740, 9799743,
  9799991, 9799992, 9799998, 9800009, 9800030, 10029763, 10029873, 10029878,
  10345647, 10563213, 10687110, 10780088, 10918020, 10971731, 11039663,
  11090854, 11090856, 11093289, 11233115, 11270640, 11299909, 11439335,
  11501948, 11685486, 11685488, 11749431, 11876186, 11877375, 11931440,
  11945283, 12021856, 12021863, 12203684, 12206292, 12261472, 12351517,
  12384824, 12404730, 12418654, 12419507, 12446301, 12474620, 12505996,
  12532746, 12551276, 12560311, 12565887, 12579255, 12748714, 12765691,
  12860876, 12920557, 12920621, 12960439, 13015581, 13044866, 13067388,
  13120671, 13369577, 13522676, 13543209, 13545524, 13641233, 13672917,
  13767773, 13804269, 13987984, 14209231, 14330171, 14364079, 14463716,
  14474606, 14579271, 14624381, 14649128, 14667452, 14667492, 14686838,
  14730671, 14764071, 14776588, 14776715, 14776716, 14776722, 14848422,
  14850138, 14877006, 14918476, 14959088, 15054213, 15063041, 15071552,
  15194849, 15195030, 15442604, 15535501, 15608562, 15643000, 15788515,
  15796476, 15829231, 15980986, 16020153, 16124516, 16168826, 16180485,
  16209079, 16215935, 16288341, 16396173, 16521273, 16551633, 16896042,
  17000844, 17081564, 17110458, 17113989, 17233277, 17312706, 17377373,
  17377401, 17377918, 17396086, 17396167, 17429097, 17476943, 17476971,
  17534546, 17534550, 17539741, 17612417, 17624009, 17624317, 17647528,
  17748317, 17792392, 17813253, 18029637, 18080765, 18121618, 18231626,
  18353715, 18375387, 18393005, 18393010, 18412480, 18416315, 18435588,
  18435589, 18491925, 18497124, 18604208, 18655878, 18678626, 18688726,
  18688735, 18728710, 18766129, 18798596, 18805260, 18845553,
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateVin(taken: Set<string>): string {
  for (;;) {
    let vin = '';
    for (let i = 0; i < 17; i += 1) {
      vin += VIN_CHARS[randomInt(0, VIN_CHARS.length - 1)];
    }
    if (!taken.has(vin)) {
      taken.add(vin);
      return vin;
    }
  }
}

function buildPrice(basePrice: number, year: number): number {
  const age = Math.max(0, REFERENCE_YEAR - year);
  const depreciation = Math.pow(0.9, age);
  const jitter = 0.95 + Math.random() * 0.1;
  return Math.round((basePrice * depreciation * jitter) / 100) * 100;
}

function buildImagePool(count: number): string[] {
  return shuffle(PEXELS_PHOTO_IDS)
    .slice(0, count)
    .map(
      (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`,
    );
}

function loadEnvFile(): void {
  try {
    process.loadEnvFile('.env');
  } catch {
    // .env is optional; fall back to process environment variables.
  }
}

async function main() {
  loadEnvFile();

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [],
  });
  await dataSource.initialize();

  try {
    const salesPersons = await dataSource.query<SalesPerson[]>(
      'SELECT id, name, roles FROM "user" WHERE id = ANY($1)',
      [SALES_PERSON_IDS],
    );

    const missing = SALES_PERSON_IDS.filter(
      (id) => !salesPersons.some((person) => person.id === id),
    );
    if (missing.length > 0) {
      throw new Error(`Sales person(s) not found: ${missing.join(', ')}`);
    }

    const cannotSell = salesPersons.filter(
      (person) =>
        !person.roles.includes('sales_person') &&
        !person.roles.includes('owner'),
    );
    if (cannotSell.length > 0) {
      throw new Error(
        `User(s) cannot record sales: ${cannotSell
          .map((person) => person.id)
          .join(', ')}`,
      );
    }

    const existingRows = await dataSource.query<{ vin: string }[]>(
      'SELECT vin FROM car',
    );
    const takenVins = new Set(existingRows.map((row) => row.vin));

    const templates = shuffle(CAR_CATALOG).slice(0, CAR_COUNT);
    const assignments = shuffle([
      ...Array<string>(CAR_COUNT / 2).fill(SALES_PERSON_IDS[0]),
      ...Array<string>(CAR_COUNT / 2).fill(SALES_PERSON_IDS[1]),
    ]);
    const imageUrls = buildImagePool(CAR_COUNT * IMAGES_PER_CAR);
    const salesPersonById = new Map(
      salesPersons.map((person) => [person.id, person]),
    );

    const inserted: {
      year: number;
      brand: string;
      model: string;
      price: string;
      vin: string;
      sales_person_id: string;
    }[] = [];

    for (let index = 0; index < templates.length; index += 1) {
      const template = templates[index];
      const year = randomInt(2019, REFERENCE_YEAR);
      const salesPersonId = assignments[index];
      const images = imageUrls.slice(
        index * IMAGES_PER_CAR,
        (index + 1) * IMAGES_PER_CAR,
      );
      const createdAt = new Date(
        Date.now() - randomInt(0, 540) * 24 * 60 * 60 * 1000,
      );

      const rows = await dataSource.query<(typeof inserted)[number][]>(
        `INSERT INTO car
           (brand, model, year, price, status, vin, images,
            sales_person_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5::car_status_enum, $6, $7, $8, $9, $9)
         RETURNING year, brand, model, price, vin, sales_person_id`,
        [
          template.brand,
          template.model,
          year,
          buildPrice(template.basePrice, year),
          'available',
          generateVin(takenVins),
          images,
          salesPersonId,
          createdAt,
        ],
      );

      inserted.push(rows[0]);
    }

    for (const car of inserted) {
      const seller = salesPersonById.get(car.sales_person_id);
      const price = Number(car.price).toLocaleString('en-US');
      console.log(
        `${car.year} ${car.brand} ${car.model} — $${price} | VIN ${car.vin} | seller ${seller?.name ?? car.sales_person_id}`,
      );
    }

    const perSeller = SALES_PERSON_IDS.map((id) => {
      const count = inserted.filter((car) => car.sales_person_id === id).length;
      return `${salesPersonById.get(id)?.name ?? id}: ${count}`;
    }).join(', ');

    console.log(`\nCreated ${inserted.length} cars. Assigned — ${perSeller}`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error('Failed to seed cars:', error);
  process.exitCode = 1;
});
