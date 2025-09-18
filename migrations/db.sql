-- =====================================================
-- TABLES DEFINITION
-- =====================================================

CREATE TABLE
  public.activity (
    lesson_code integer NOT NULL,
    instruction character varying(300) NOT NULL,
    start_date timestamp(6) without time zone NOT NULL,
    end_activity timestamp(6) without time zone NOT NULL,
    isFree boolean DEFAULT false
  );

CREATE TABLE
  public.attendance (
    code integer NOT NULL,
    entry_time time without time zone,
    state character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    entity_identifier character(8) NOT NULL,
    entity_type character(1) DEFAULT 's'::bpchar NOT NULL,
    priority smallint,
    branch_code smallint
  );

CREATE SEQUENCE public.attendance_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.attendance_code_seq OWNED BY public.attendance.code;

-- attention table removed as per updates

CREATE TABLE
  public.branch (
    code integer NOT NULL,
    name character varying(50) NOT NULL,
    address character varying(100) NOT NULL,
    email character varying(50) NOT NULL,
    telephone character varying(15) NOT NULL,
    is_academy boolean DEFAULT false
  );

CREATE SEQUENCE public.branch_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.branch_code_seq OWNED BY public.branch.code;

CREATE TABLE
  public.calification (
    lesson_code integer NOT NULL,
    exam_day date NOT NULL,
    uploaded_at timestamp(6) without time zone,
    keys json
  );

CREATE SEQUENCE public.calification_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.calification_code_seq OWNED BY public.calification.lesson_code;

CREATE TABLE
  public.score (
    lesson_code integer NOT NULL,
    register_code character(10) NOT NULL,
    score numeric(10, 2) NOT NULL,
    obs character varying(300),
    keys character varying(80)
  );

CREATE TABLE
  public.canceled (
    income_code integer NOT NULL,
    justification character varying(50) NOT NULL
  );

CREATE TABLE
  public.cash (
    code character(10) NOT NULL,
    branch_code smallint NOT NULL,
    cash numeric(10, 2) NOT NULL,
    state boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    user_code character(10)
  );

CREATE TABLE
  public.cashactiontype (
    code integer NOT NULL,
    name character varying(200) NOT NULL,
    mode character varying(7) NOT NULL
  );

CREATE SEQUENCE public.cashactiontype_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.cashactiontype_code_seq OWNED BY public.cashactiontype.code;

-- config table removed as per updates

CREATE TABLE
  public.course (
    code integer NOT NULL,
    name character varying(50) NOT NULL
  );

CREATE TABLE
  public.customer (
    code integer NOT NULL,
    name character varying(150) NOT NULL,
    contact_number character varying(50)
  );

CREATE SEQUENCE public.customer_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.customer_code_seq OWNED BY public.customer.code;

CREATE TABLE
  public.customer_income (
    income_code integer NOT NULL,
    customer_code integer,
    name character varying(80)
  );

CREATE TABLE
  public.cycle (
    code character(8) NOT NULL,
    type character(2) NOT NULL,
    "from" date NOT NULL,
    "to" date NOT NULL,
    monthly numeric(10, 2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    branch_code smallint,
    attendance json,
    title character varying(100),
    modular_code character varying(20)
  );

CREATE TABLE
  public.degree (code character(9) NOT NULL, cycle_code character(8));

CREATE TABLE
  public.expense (
    code integer NOT NULL,
    cashactiontype_code integer NOT NULL,
    description character varying(400) NOT NULL,
    voucher_num character varying(20),
    cash_code character(10) NOT NULL,
    total numeric(8, 2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL
  );

CREATE SEQUENCE public.expense_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.expense_code_seq OWNED BY public.expense.code;

CREATE TABLE
  public.expense_detail (
    code integer NOT NULL,
    expense_code integer NOT NULL,
    description character varying(60) NOT NULL,
    quantity smallint DEFAULT 1 NOT NULL,
    unit_price numeric(8, 2) NOT NULL
  );

CREATE SEQUENCE public.expense_detail_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.expense_detail_code_seq OWNED BY public.expense_detail.code;

CREATE TABLE
  public.extrainfo (
    code serial,
    student_dni character(8) NOT NULL,
    type character varying(25) NOT NULL,
    info character varying(350) NOT NULL,
    attached character varying(100)
  );

CREATE TABLE
  public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

CREATE SEQUENCE public.failed_jobs_id_seq START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;

CREATE TABLE
  public.family (
    dni character(8) NOT NULL,
    telephone character varying(20),
    profession character varying(50) NOT NULL,
    degree character varying(20) NOT NULL,
    institute character varying(100),
    image character varying(100)
  );

CREATE TABLE
  public.family_student (
    family_dni character(8) NOT NULL,
    student_dni character(8) NOT NULL,
    relation_type character(1) NOT NULL,
    is_main boolean NOT NULL
  );

CREATE TABLE
  public.familywork (
    family_dni character(8) NOT NULL,
    name character varying(100) NOT NULL,
    "position" character varying(100),
    address character varying(100) NOT NULL,
    phone character varying(50)
  );

CREATE TABLE
  public.file (
    code integer NOT NULL,
    type character(3) NOT NULL,
    dni character(8) NOT NULL,
    name character varying(100) NOT NULL,
    tag character varying(20),
    size integer NOT NULL,
    created_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6)
    with
      time zone NOT NULL,
      parent_code integer,
      parent_path character varying(200)
  );

CREATE SEQUENCE public.file_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.file_code_seq OWNED BY public.file.code;

CREATE TABLE
  public.fileshare (
    code integer NOT NULL,
    file_code integer NOT NULL,
    message character varying(20),
    receiver character varying(10)
  );

CREATE SEQUENCE public.fileshare_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.fileshare_code_seq OWNED BY public.fileshare.code;

CREATE TABLE
  public.incidence (
    code integer NOT NULL,
    user_code character(10) NOT NULL,
    type character(2) NOT NULL,
    title character varying(100) NOT NULL,
    description character varying(1000) NOT NULL,
    agreement character varying(300) NOT NULL,
    file_attached character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    state boolean DEFAULT true,
    extra character varying(100),
    branch_code integer DEFAULT 1
  );

CREATE SEQUENCE public.incidence_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.incidence_code_seq OWNED BY public.incidence.code;

CREATE TABLE
  public.incidence_entity (
    entity_identifier character(8) NOT NULL,
    incidence_code integer NOT NULL,
    entity_type character varying(7) DEFAULT 'student'::character varying NOT NULL,
    actor_type character varying(12) DEFAULT 'involucrado'::character varying NOT NULL
  );

CREATE TABLE
  public.income (
    code integer NOT NULL,
    series character(4),
    correlative character(8) NOT NULL,
    type character(2) NOT NULL,
    cash_code character(10) NOT NULL,
    total_discount numeric(8, 2) NOT NULL,
    total numeric(8, 2) NOT NULL,
    state boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL
  );

CREATE SEQUENCE public.income_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.income_code_seq OWNED BY public.income.code;

CREATE TABLE
  public.income_detail (
    code integer NOT NULL,
    income_code integer NOT NULL,
    cashactiontype_code integer NOT NULL,
    title character varying(100),
    topay numeric(8, 2) NOT NULL,
    discount numeric(8, 2) DEFAULT 0 NOT NULL,
    paid numeric(8, 2) DEFAULT 0 NOT NULL
  );

CREATE SEQUENCE public.income_detail_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.income_detail_code_seq OWNED BY public.income_detail.code;

-- inspection table removed as per updates

CREATE TABLE
  public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
  );

CREATE SEQUENCE public.jobs_id_seq START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;

CREATE TABLE
  public.justification (
    attendance_code integer NOT NULL,
    attached character varying(100),
    description character varying(200) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL
  );

CREATE TABLE
  public.lesson (
    code integer NOT NULL,
    op_code integer NOT NULL,
    title character varying(100) NOT NULL,
    type character varying(8) NOT NULL,
    created_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) NOT NULL,
    updated_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) NOT NULL,
    visible boolean DEFAULT true
  );

CREATE SEQUENCE public.lesson_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.lesson_code_seq OWNED BY public.lesson.code;

CREATE TABLE
  public.content (
    lesson_code integer NOT NULL,
    description text NOT NULL,
    file_code integer,
    lesson_type character varying(15) NOT NULL,
    link character varying(350)
  );

CREATE TABLE
  public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
  );

CREATE SEQUENCE public.migrations_id_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;

CREATE SEQUENCE public.course_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.course_code_seq OWNED BY public.course.code;

CREATE TABLE
  public.op (
    code integer NOT NULL,
    teacher_dni character(8) NOT NULL,
    course_code integer,
    sts character varying(10) []
  );

CREATE SEQUENCE public.op_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.op_code_seq OWNED BY public.op.code;

CREATE TABLE
  public.payment (
    code integer NOT NULL,
    register_code character(10) NOT NULL,
    pcode smallint NOT NULL,
    description character varying(100),
    topay date NOT NULL,
    paid date,
    amount numeric(10, 2) NOT NULL,
    payment_type character(2)
  );

CREATE SEQUENCE public.payment_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.payment_code_seq OWNED BY public.payment.code;

CREATE TABLE
  public.person (
    dni character(8) NOT NULL,
    name character varying(50) NOT NULL,
    lastname character varying(80) NOT NULL,
    birthdate date,
    gender character(1) NOT NULL,
    ubigeo character varying(10) NOT NULL,
    district character varying(50) NOT NULL,
    address character varying(150) NOT NULL,
    email character varying(50),
    phone character varying(50),
    obs character varying(100),
    created_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6)
    with
      time zone NOT NULL,
      updated_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6)
    with
      time zone NOT NULL
  );

CREATE TABLE
  public.profile (
    person_dni character(8) NOT NULL,
    password character varying(100),
    image character varying(100) DEFAULT 'default_user.png'::character varying NOT NULL,
    last_logout timestamp without time zone,
    description character varying(100),
    original_password character varying(10) DEFAULT public.random_string(10) NOT NULL
  );

-- qresponse and question tables removed as per updates

CREATE TABLE
  public.register (
    code character(10) NOT NULL,
    student_dni character(8) NOT NULL,
    section_code character(10) NOT NULL,
    state character(1) DEFAULT 'i'::bpchar NOT NULL,
    monthly numeric(10, 2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    priority smallint DEFAULT 0
  );

CREATE TABLE
  public.register_income (
    income_code integer NOT NULL,
    register_code character(10) NOT NULL
  );

CREATE TABLE
  public.response (
    lesson_code integer NOT NULL,
    register_code character(10) NOT NULL,
    response_message character varying(500) NOT NULL,
    received boolean DEFAULT false,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    files integer[] NOT NULL
  );

CREATE TABLE
  public.rol (
    name character varying(20) NOT NULL,
    description character varying(100) NOT NULL,
    code character(1) NOT NULL
  );

CREATE TABLE
  public.schedule (
    code integer NOT NULL,
    day integer NOT NULL,
    from_time time without time zone NOT NULL,
    to_time time without time zone NOT NULL,
    state boolean NOT NULL,
    op_code integer
  );

CREATE SEQUENCE public.schedule_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.schedule_code_seq OWNED BY public.schedule.code;

CREATE TABLE
  public.section (
    code character(10) NOT NULL,
    name character(1) NOT NULL,
    degree_code character(9),
    tutor character(8)
  );

CREATE SEQUENCE public.sesion_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.sesion_code_seq OWNED BY public.activity.lesson_code;

-- sesion_files_code_seq removed with lesson_files table

CREATE TABLE
  public.student (
    dni character(8) NOT NULL,
    branch_code smallint NOT NULL
  );

CREATE TABLE
  public.support (
    code integer NOT NULL,
    type character varying(50) NOT NULL,
    from_dni character(8) NOT NULL,
    content character varying(400) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL
  );

CREATE SEQUENCE public.support_code_seq AS integer START
WITH
  1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.support_code_seq OWNED BY public.support.code;

CREATE TABLE
  public.surrendered (
    cash_code character(10) NOT NULL,
    amount numeric(10, 2) NOT NULL,
    recipient character varying(80) NOT NULL,
    reason character varying(50)
  );

CREATE TABLE
  public.teacher (
    dni character(8) NOT NULL,
    startdate date,
    state boolean DEFAULT false NOT NULL,
    specialty character(2) NOT NULL,
    branch_code smallint DEFAULT 1
  );

CREATE TABLE
  public.exam (
    lesson_code integer NOT NULL,
    start_date timestamp without time zone NOT NULL,
    att_dur integer NOT NULL,
    duration integer NOT NULL,
    opened boolean DEFAULT false NOT NULL,
    paginated_by integer DEFAULT 0 NOT NULL,
    backable boolean DEFAULT false NOT NULL,
    same_dur boolean DEFAULT false NOT NULL,
    score_type character(2) NOT NULL,
    randomized boolean DEFAULT false
  );

CREATE TABLE
  public.tracking (
    code serial NOT NULL,
    user_code character(10),
    branch_code smallint,
    action character varying(20) NOT NULL,
    description character varying(800) NOT NULL,
    created_at timestamp(6) NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone
  );

CREATE TABLE
  public.sign_history (
    code serial NOT NULL,
    user_code character(10),
    revoked boolean,
    device character varying(200),
    token character varying(350),
    created_at timestamp(6) NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone
  );

-- unit_code_seq removed with unit table

CREATE TABLE
  public."user" (
    code character(10) NOT NULL,
    name character varying(50) NOT NULL,
    lastname character varying(80) NOT NULL,
    email character varying(50),
    branch_code smallint,
    dni character(8) NOT NULL,
    state boolean DEFAULT true NOT NULL,
    gender character(1) DEFAULT 'F'::bpchar NOT NULL,
    image character varying(100) DEFAULT 'default_user.png'::character varying NOT NULL,
    phone character varying(50),
    address character varying(80) NOT NULL,
    password character varying(100),
    rol_code character(1),
    current_year integer DEFAULT date_part('year'::text, CURRENT_DATE) NOT NULL,
    access character(1) DEFAULT 'm'::bpchar
  );

