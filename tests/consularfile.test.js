jest.setTimeout(30000);

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('../passport-config');
const app = require('../app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Consular File API', () => {
  let fileId;

  it('should create a consular file', async () => {
    const res = await request(app)
      .post('/api/consular-files')
      .send({
        fileNumber: "TEST-001",
        name: "Test User",
        openedOn: "2025-06-01",
        spouse: "Test Spouse",
        observations: "Test obs",
        passportsGranted: [{ number: "P1", issueDate: "2025-01-01", expiryDate: "2027-01-01", country: "Mozambique" }],
        repatriations: [{ date: "2025-02-01", conditions: "Condition", stateCharges: "None" }],
        civilNotarialActs: "Test acts",
        applicantSignature: "Test User"
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.fileNumber).toBe("TEST-001");
    fileId = res.body._id;
  });

  it('should fetch all consular files', async () => {
    await request(app).post('/api/consular-files').send({
      fileNumber: "TEST-002",
      name: "Test User 2",
      openedOn: "2025-07-01",
      spouse: "",
      observations: "",
      passportsGranted: [],
      repatriations: [],
      civilNotarialActs: "",
      applicantSignature: ""
    });

    const res = await request(app).get('/api/consular-files');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.records)).toBe(true);
    expect(res.body.records.length).toBeGreaterThan(0);
  });

  it('should fetch a single consular file', async () => {
    const createRes = await request(app).post('/api/consular-files').send({
      fileNumber: "TEST-003",
      name: "Test Single",
      openedOn: "2025-08-01",
      spouse: "",
      observations: "",
      passportsGranted: [],
      repatriations: [],
      civilNotarialActs: "",
      applicantSignature: ""
    });
    const id = createRes.body._id;
    const res = await request(app).get(`/api/consular-files/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.fileNumber).toBe("TEST-003");
  });

  it('should update a consular file', async () => {
    const createRes = await request(app).post('/api/consular-files').send({
      fileNumber: "TEST-004",
      name: "Test Update",
      openedOn: "2025-09-01",
      spouse: "",
      observations: "Old obs",
      passportsGranted: [],
      repatriations: [],
      civilNotarialActs: "",
      applicantSignature: ""
    });
    const id = createRes.body._id;
    const res = await request(app)
      .put(`/api/consular-files/${id}`)
      .send({ observations: "Updated obs" });
    expect(res.statusCode).toBe(200);
    expect(res.body.observations).toBe("Updated obs");
  });

  it('should delete a consular file', async () => {
    const createRes = await request(app).post('/api/consular-files').send({
      fileNumber: "TEST-005",
      name: "Test Delete",
      openedOn: "2025-10-01",
      spouse: "",
      observations: "",
      passportsGranted: [],
      repatriations: [],
      civilNotarialActs: "",
      applicantSignature: ""
    });
    const id = createRes.body._id;
    const res = await request(app).delete(`/api/consular-files/${id}`);
    expect([200, 204]).toContain(res.statusCode);
  });

  it('should not create with missing required fields', async () => {
    const res = await request(app).post('/api/consular-files').send({
      name: "Missing File Number"
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  // --- Search and Pagination tests below ---

  it('should search consular files by fileNumber', async () => {
    await request(app).post('/api/consular-files').send({
      fileNumber: "CF-SRCH-001",
      name: "Search Test 1",
      openedOn: "2025-01-01",
      applicantSignature: "A"
    });
    await request(app).post('/api/consular-files').send({
      fileNumber: "CF-SRCH-002",
      name: "Search Test 2",
      openedOn: "2025-01-01",
      applicantSignature: "B"
    });

    const res = await request(app).get('/api/consular-files?search=CF-SRCH-001');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.records)).toBe(true);
    expect(res.body.records.length).toBeGreaterThan(0);
    expect(res.body.records[0].fileNumber).toBe('CF-SRCH-001');
  });

  it('should paginate consular files', async () => {
    // Add 12 consular files
    for (let i = 0; i < 12; i++) {
      await request(app).post('/api/consular-files').send({
        fileNumber: `CF-PAG-${i}`,
        name: `Paginate Consular ${i}`,
        openedOn: "2025-01-01",
        applicantSignature: "Paginate"
      });
    }

    // Page 1, limit 5
    let res = await request(app).get('/api/consular-files?page=1&limit=5');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.records)).toBe(true);
    expect(res.body.records.length).toBe(5);
    expect(res.body.page).toBe(1);

    // Page 3, limit 5
    res = await request(app).get('/api/consular-files?page=3&limit=5');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.records)).toBe(true);
    // Should be 2 on last page (since 12 total)
    expect(res.body.records.length).toBe(2);
    expect(res.body.page).toBe(3);
  });
});