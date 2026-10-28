export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 120).notNullable();
    table.string('email', 160).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enu('role', ['admin', 'professor', 'student']).notNullable().index();
    table.string('phone', 30).nullable();
    table.string('student_code', 40).nullable().unique();
    table.boolean('active').notNullable().defaultTo(true).index();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('courses', (table) => {
    table.increments('id').primary();
    table.string('code', 30).notNullable().unique();
    table.string('name', 140).notNullable();
    table.text('description').nullable();
    table.integer('professor_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.json('schedule_days').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.string('room', 60).nullable();
    table.integer('capacity').unsigned().notNullable().defaultTo(30);
    table.enu('status', ['draft', 'open', 'closed', 'completed']).notNullable().defaultTo('draft').index();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('enrollments', (table) => {
    table.increments('id').primary();
    table.integer('student_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('course_id').unsigned().notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.enu('status', ['active', 'withdrawn', 'completed']).notNullable().defaultTo('active').index();
    table.timestamp('enrolled_at').notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
    table.unique(['student_id', 'course_id']);
  });

  await knex.schema.createTable('grades', (table) => {
    table.increments('id').primary();
    table.integer('enrollment_id').unsigned().notNullable().references('id').inTable('enrollments').onDelete('CASCADE');
    table.string('concept', 100).notNullable();
    table.decimal('score', 6, 2).notNullable();
    table.decimal('max_score', 6, 2).notNullable().defaultTo(100);
    table.decimal('weight', 5, 2).notNullable().defaultTo(100);
    table.date('date').notNullable();
    table.text('notes').nullable();
    table.timestamps(true, true);
    table.unique(['enrollment_id', 'concept']);
  });

  await knex.schema.createTable('attendance', (table) => {
    table.increments('id').primary();
    table.integer('enrollment_id').unsigned().notNullable().references('id').inTable('enrollments').onDelete('CASCADE');
    table.date('date').notNullable();
    table.enu('status', ['present', 'absent', 'late', 'excused']).notNullable();
    table.text('notes').nullable();
    table.timestamps(true, true);
    table.unique(['enrollment_id', 'date']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('attendance');
  await knex.schema.dropTableIfExists('grades');
  await knex.schema.dropTableIfExists('enrollments');
  await knex.schema.dropTableIfExists('courses');
  await knex.schema.dropTableIfExists('users');
}

