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

describe('Registration API', () => {
  let registrationId;

  it('should create a registration', async () => {
    const res = await request(app)
      .post('/api/registrations')
      .send({
        fullName: "Test User",
        fileNumber: "REG-001",
        countryPlaceOfBirth: "Mozambique",
        birthDate: "1990-01-01",
        maritalStatus: "Single",
        profession: "Engineer",
        fatherName: "Father Test",
        motherName: "Mother Test",
        education: "University",
        workplaceOrSchool: "Test Company",
        phone: "0712345678",
        passportOrIdNumber: "P123456",
        passportIssuedAt: "Maputo",
        passportValidUntil: "2030-01-01",
        residenceKenya: "Nairobi",
        residenceMozambique: "Maputo",
        district: "Maputo",
        cellPhone: "0712345678",
        documentsPresented: "Passport, ID",
        issuedOn: "2024-01-01",
        entryDateKenya: "2022-01-01",
        currentResidence: "Nairobi",
        observations: "No observations",
        spouse: {
          fullName: "Spouse Name",
          nationality: "Mozambican",
          idDocument: "ID12345",
          profession: "Teacher",
          workplace: "School",
          cellPhone: "0798765432"
        },
        familyMozambique: [
          { name: "Family A", relationship: "Brother", age: 30, residence: "Maputo" }
        ],
        familyUnder15: [
          { name: "Child A", relationship: "Son", age: 10, residence: "Nairobi" }
        ],
        passportPhoto: "path/to/photo.jpg",
        formImages: ["path/to/img1.jpg", "path/to/img2.jpg"]
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.fullName).toBe("Test User");
    registrationId = res.body._id;
  });

  it('should fetch all registrations', async () => {
    await request(app).post('/api/registrations').send({
      fullName: "Test User 2",
      fileNumber: "REG-002",
      countryPlaceOfBirth: "Mozambique",
      birthDate: "1991-01-01",
      maritalStatus: "Married",
      profession: "Doctor",
      fatherName: "Father Test 2",
      motherName: "Mother Test 2",
      education: "College",
      workplaceOrSchool: "Health Center",
      phone: "0712345679",
      passportOrIdNumber: "P654321",
      passportIssuedAt: "Beira",
      passportValidUntil: "2031-01-01",
      residenceKenya: "Mombasa",
      residenceMozambique: "Beira",
      district: "Beira",
      cellPhone: "0712345679",
      documentsPresented: "Passport",
      issuedOn: "2024-02-01",
      entryDateKenya: "2022-02-01",
      currentResidence: "Mombasa",
      observations: "",
      spouse: {
        fullName: "Spouse Two",
        nationality: "Mozambican",
        idDocument: "ID54321",
        profession: "Nurse",
        workplace: "Clinic",
        cellPhone: "0798765433"
      },
      familyMozambique: [
        { name: "Family B", relationship: "Sister", age: 28, residence: "Beira" }
      ],
      familyUnder15: [],
      passportPhoto: "path/to/photo2.jpg",
      formImages: ["path/to/img3.jpg"]
    });

    const res = await request(app).get('/api/registrations');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.records)).toBe(true);
    expect(res.body.records.length).toBeGreaterThan(0);
    expect(typeof res.body.total).toBe('number');
    expect(typeof res.body.totalPages).toBe('number');
    expect(typeof res.body.page).toBe('number');
  });

  it('should fetch a single registration by id', async () => {
    // Create one to fetch
    const createRes = await request(app).post('/api/registrations').send({
      fullName: "Test User 3",
      fileNumber: "REG-003"
    });
    const id = createRes.body._id;
    const res = await request(app).get(`/api/registrations/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.fullName).toBe("Test User 3");
  });

  it('should update a registration', async () => {
    // Create one to update
    const createRes = await request(app).post('/api/registrations').send({
      fullName: "Test User 4",
      fileNumber: "REG-004"
    });
    const id = createRes.body._id;
    const res = await request(app)
      .put(`/api/registrations/${id}`)
      .send({ profession: "Updated Profession" });
    expect(res.statusCode).toBe(200);
    expect(res.body.profession).toBe("Updated Profession");
  });

  it('should delete a registration', async () => {
    // Create one to delete
    const createRes = await request(app).post('/api/registrations').send({
      fullName: "Test User 5",
      fileNumber: "REG-005"
    });
    const id = createRes.body._id;
    const res = await request(app).delete(`/api/registrations/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Deleted");
  });

  it('should not create with missing required fields', async () => {
    // Only fullName is required
    const res = await request(app).post('/api/registrations').send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  // --- Search and Pagination tests below ---

  it('should search registrations by name', async () => {
    await request(app).post('/api/registrations').send({ fullName: "Alice Wonderland", fileNumber: "SRCH-001" });
    await request(app).post('/api/registrations').send({ fullName: "Bob Builder", fileNumber: "SRCH-002" });

    const res = await request(app).get('/api/registrations?search=Alice');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.records)).toBe(true);
    expect(res.body.records.length).toBeGreaterThan(0);
    expect(res.body.records[0].fullName).toMatch(/Alice/i);
  });

  it('should paginate registrations', async () => {
    // Add 12 registrations
    for (let i = 0; i < 12; i++) {
      await request(app).post('/api/registrations').send({ fullName: `Paginate User ${i}`, fileNumber: `PG-${i}` });
    }

    // Page 1, limit 5
    let res = await request(app).get('/api/registrations?page=1&limit=5');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.records)).toBe(true);
    expect(res.body.records.length).toBe(5);
    expect(res.body.page).toBe(1);

    // Page 3, limit 5
    res = await request(app).get('/api/registrations?page=3&limit=5');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.records)).toBe(true);
    // Should be 2 on last page (since 12 total)
    expect(res.body.records.length).toBe(2);
    expect(res.body.page).toBe(3);
  });
});