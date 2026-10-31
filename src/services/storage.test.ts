import { test } from 'node:test';
import assert from 'node:assert';
import { storage } from './storage.ts';

test('storage: authenticate validates credentials correctly', () => {
  const adminUser = storage.authenticate('admin', 'admin123');
  assert.ok(adminUser, 'Admin should authenticate with valid password');
  assert.strictEqual(adminUser?.role, 'admin');

  const invalidUser = storage.authenticate('admin', 'wrongpass');
  assert.strictEqual(invalidUser, null, 'Invalid password should return null');

  const nonexistent = storage.authenticate('nonexistent_user', 'any');
  assert.strictEqual(nonexistent, null, 'Nonexistent username should return null');
});

test('storage: addUser creates a new manager/admin and persists credentials', () => {
  const newUser = storage.addUser({
    username: 'vice_principal_test',
    password: 'secret_password_123',
    name: 'លោក ស៊ុន ពិសិដ្ឋ',
    role: 'director',
    email: 'piseth@toulsambour.edu.kh',
    phone: '012 999 888',
    status: 'active',
  });

  assert.ok(newUser.id, 'New user should receive an id');
  assert.strictEqual(newUser.username, 'vice_principal_test');

  const authed = storage.authenticate('vice_principal_test', 'secret_password_123');
  assert.ok(authed, 'Newly created user must authenticate with their password');
  assert.strictEqual(authed?.name, 'លោក ស៊ុន ពិសិដ្ឋ');

  // Clean up
  storage.deleteUser(newUser.id);
  const afterDelete = storage.authenticate('vice_principal_test', 'secret_password_123');
  assert.strictEqual(afterDelete, null, 'Deleted user cannot authenticate');
});

test('storage: updateSubject and deleteSubject work accurately and persist', () => {
  const initialCount = storage.getSubjects().length;
  const newSubject = storage.addSubject({
    code: 'TST-09',
    nameKm: 'មុខវិជ្ជាសាកល្បង',
    nameEn: 'Test Subject',
    gradeLevel: 'ថ្នាក់ទី ៩',
    hoursPerWeek: 3,
    teacherName: 'លោកគ្រូ សាកល្បង',
  });

  assert.strictEqual(storage.getSubjects().length, initialCount + 1);

  // Update teacher & hours
  const updated = storage.updateSubject(newSubject.id, {
    teacherName: 'អ្នកគ្រូ ថ្មី',
    hoursPerWeek: 5,
  });
  assert.strictEqual(updated, true);

  const found = storage.getSubjects().find((s) => s.id === newSubject.id);
  assert.strictEqual(found?.teacherName, 'អ្នកគ្រូ ថ្មី');
  assert.strictEqual(found?.hoursPerWeek, 5);

  // Delete subject
  const deleted = storage.deleteSubject(newSubject.id);
  assert.strictEqual(deleted, true);
  assert.strictEqual(storage.getSubjects().length, initialCount);
});

test('storage: addSubjectToExam, removeSubjectFromExam, and setExamMaxScore (<= 150)', () => {
  const exams = storage.getExams();
  assert.ok(exams.length > 0);
  const examId = exams[0].id;

  // Set max score up to 150
  storage.setExamMaxScore(examId, 120);
  assert.strictEqual(storage.getExams().find((e) => e.id === examId)?.maxScorePerSubject, 120);

  // Capped at 150 max
  storage.setExamMaxScore(examId, 200);
  assert.strictEqual(storage.getExams().find((e) => e.id === examId)?.maxScorePerSubject, 150);

  // Add and remove subject to exam
  const testSub = storage.addSubject({
    code: 'EX-SUB-1',
    nameKm: 'មុខវិជ្ជាបន្ថែម',
    nameEn: 'Extra Subject',
    gradeLevel: 'ថ្នាក់ទី ៧',
    hoursPerWeek: 2,
    teacherName: 'គ្រូ',
  });

  storage.addSubjectToExam(examId, testSub.id);
  const examAfterAdd = storage.getExams().find((e) => e.id === examId);
  assert.ok(examAfterAdd?.subjectIds?.includes(testSub.id));

  storage.removeSubjectFromExam(examId, testSub.id);
  const examAfterRemove = storage.getExams().find((e) => e.id === examId);
  assert.strictEqual(examAfterRemove?.subjectIds?.includes(testSub.id), false);

  // Clean up
  storage.deleteSubject(testSub.id);
  storage.setExamMaxScore(examId, 50);
});

