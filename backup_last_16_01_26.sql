--
-- PostgreSQL database dump
--

\restrict M3B1YTS9JJI0gJYfVval25mKIRKo9dHuXSZoxjrPXloCDgP9kT1641jEGLr55yn

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: family_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.family_members (
    id text NOT NULL,
    household_id uuid NOT NULL,
    name text NOT NULL,
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.family_members OWNER TO postgres;

--
-- Name: family_wall_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.family_wall_notes (
    id uuid NOT NULL,
    household_id uuid NOT NULL,
    content text NOT NULL,
    author_id text NOT NULL,
    color text NOT NULL,
    rotation real NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.family_wall_notes OWNER TO postgres;

--
-- Name: households; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.households (
    id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    password_hash text
);


ALTER TABLE public.households OWNER TO postgres;

--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.push_subscriptions (
    id uuid NOT NULL,
    household_id uuid NOT NULL,
    family_member_id text,
    endpoint text NOT NULL,
    keys jsonb NOT NULL,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    family_member_ids text[]
);


ALTER TABLE public.push_subscriptions OWNER TO postgres;

--
-- Name: shopping_favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shopping_favorites (
    id integer NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    usage_count integer DEFAULT 1 NOT NULL,
    last_quantity integer DEFAULT 1,
    household_id uuid NOT NULL
);


ALTER TABLE public.shopping_favorites OWNER TO postgres;

--
-- Name: shopping_favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shopping_favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shopping_favorites_id_seq OWNER TO postgres;

--
-- Name: shopping_favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shopping_favorites_id_seq OWNED BY public.shopping_favorites.id;


--
-- Name: shopping_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shopping_items (
    id integer NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    household_id uuid NOT NULL
);


ALTER TABLE public.shopping_items OWNER TO postgres;

--
-- Name: shopping_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shopping_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shopping_items_id_seq OWNER TO postgres;

--
-- Name: shopping_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shopping_items_id_seq OWNED BY public.shopping_items.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid NOT NULL,
    title text NOT NULL,
    date date NOT NULL,
    time_label text,
    priority text NOT NULL,
    recurrence text,
    description text,
    assignees jsonb NOT NULL,
    series_id uuid,
    days_of_week integer[],
    duration_weeks integer,
    notification_time integer,
    color text,
    notification_sent boolean DEFAULT false,
    end_date date,
    is_completed boolean DEFAULT false,
    created_by text,
    created_at timestamp with time zone DEFAULT now(),
    household_id uuid NOT NULL
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: shopping_favorites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_favorites ALTER COLUMN id SET DEFAULT nextval('public.shopping_favorites_id_seq'::regclass);


--
-- Name: shopping_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_items ALTER COLUMN id SET DEFAULT nextval('public.shopping_items_id_seq'::regclass);


--
-- Data for Name: family_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.family_members (id, household_id, name, color, created_at) FROM stdin;
mama	0acd1a29-c7c5-4445-8027-7b8607f65a92	Maria	#f97316	2025-12-04 12:06:43.565409+00
papa	0acd1a29-c7c5-4445-8027-7b8607f65a92	Alvaro	#22c55e	2025-12-04 12:06:43.577357+00
familia	0acd1a29-c7c5-4445-8027-7b8607f65a92	Todos	#6366f1	2025-12-04 12:06:43.590131+00
mamaWork	0acd1a29-c7c5-4445-8027-7b8607f65a92	Maria/Work	#c5e03aff	2025-12-14 19:40:00+00
\.


--
-- Data for Name: family_wall_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.family_wall_notes (id, household_id, content, author_id, color, rotation, image_url, created_at) FROM stdin;
\.


--
-- Data for Name: households; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.households (id, name, created_at, password_hash) FROM stdin;
00000000-0000-0000-0000-000000000000	Familia Barcelona	2026-01-16 14:38:41.113952+00	\N
0acd1a29-c7c5-4445-8027-7b8607f65a92	Barcelona Yubero	2026-01-16 14:30:19.619337+00	$2b$10$nfs3JQjQhY9HV5izmlANwOOhpZa0TGZVXC79kllwevQg8YoPNp8fS
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.push_subscriptions (id, household_id, family_member_id, endpoint, keys, user_agent, created_at, last_used_at, is_active, family_member_ids) FROM stdin;
ede0b54f-4bcc-4842-b907-c488b1bb1f1a	0acd1a29-c7c5-4445-8027-7b8607f65a92	papa	https://web.push.apple.com/QDkwzoVq4q4yC6ehCWg-qFuXu6L0edSZsOB_XcC3CBke-7-nH7iac-wwRqQGqa3W1eGAN3b2dpAxRX15ouXPZiSaTPeoFy3td_ko4HtZZBh9HeZi_9_Vy3S0KCanvPuc0AKrLGXwpRSlfZdKLhfbgKy15sAHC9fky2o6_WibmJ8	{"auth": "r3CgzBxHwHIgU8a7C2htTQ", "p256dh": "BLU_S7MY4tF0YgQaKPEqpJuX2LVdrv0adump2VpL2MX5DFCmneuFZrcFbazOvsF9e9ZAbqZ5k2gzYj3rM93r6kQ"}	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1	2025-12-10 20:24:23.321586+00	2026-01-14 09:00:23.658622+00	t	{familia,papa}
253b6ae2-dbe7-4db3-897e-144508051adf	0acd1a29-c7c5-4445-8027-7b8607f65a92	mamaWork	https://web.push.apple.com/QMRj9Ko8B-y2teDEGBx-gYdK5Hi9GQSAhmCe6jKVDwGOEkTFjhIgtFvGYbT_F02ucuGNZXclNOZ0me821JeDUJPHWlq_k4_BthFj_waCG4_b7A46UaZDVEWXJvyIbruhX31ttf791d4A0nSPbUtfdoyhprf2WfeH_0ihpRSq1X8	{"auth": "QF4V7_WzbKNURNFi1Quv5Q", "p256dh": "BO-eMnIQuNHzy6n6qJOKJPGBxyLja7ck5eVP0_0wnSAwe4Bkyr27JsGDdjYOiUgTTMfdP4BV2woLgofH-Q_msTk"}	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-12-15 21:12:47.896959+00	2026-01-14 11:30:29.371077+00	t	{mamaWork,mama,familia}
\.


--
-- Data for Name: shopping_favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shopping_favorites (id, name, category, usage_count, last_quantity, household_id) FROM stdin;
2	Quita manchas	cleaning	1	1	0acd1a29-c7c5-4445-8027-7b8607f65a92
3	Leche 	milk	1	6	0acd1a29-c7c5-4445-8027-7b8607f65a92
4	Ketchup	other	1	1	0acd1a29-c7c5-4445-8027-7b8607f65a92
\.


--
-- Data for Name: shopping_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shopping_items (id, name, category, quantity, completed, created_at, household_id) FROM stdin;
2	Quita manchas	cleaning	1	f	2026-01-13 17:28:53.017376+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3	Leche 	milk	6	f	2026-01-13 17:29:16.911251+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
4	Ketchup	other	1	f	2026-01-14 15:33:39.750625+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, date, time_label, priority, recurrence, description, assignees, series_id, days_of_week, duration_weeks, notification_time, color, notification_sent, end_date, is_completed, created_by, created_at, household_id) FROM stdin;
48579b61-a309-4406-949e-e3800bf959f7	Vacaciones navidad	2026-01-03	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-15 10:00:02.34929+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
806ff3f0-0256-4b43-9240-b74fc51603a9	Vacaciones navidad	2026-01-04	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-15 10:00:02.358851+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
32f3f88c-dadf-4290-b9d7-3f0e05b2785b	Vacaciones navidad	2025-12-31	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-15 10:00:02.486591+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
7a9de63a-d218-4dca-aa66-0d257605893d	Sommerferien	2026-07-03	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.026885+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
bf965d1c-cf7b-4e2d-a752-b7143a159be0	Sommerferien	2026-07-22	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.100754+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
32ce94b4-1bcf-488f-afea-82395751ebae	Excursión Ariadna Biblioteca	2025-12-12	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	\N	\N	f	\N	t	Alvaro	2025-12-10 13:49:32.982791+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
270d36b9-4adc-41b0-af0b-8ce591c71db7	Recoger documentación DNI niños	2025-12-17	09:30	MEDIUM	NONE	Llevar DNI viejo y pasaporte\nterminkennung 86275	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	1440	\N	f	2025-12-17	t	Alvaro	2025-12-15 19:15:12.539+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
96ceaecc-708c-4b6c-9f44-efb5c61e4956	Cena Parlament	2025-12-12	20:00	MEDIUM	NONE	Cena con el grupo de Carsten	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	60	\N	t	\N	t	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
163673e4-8b51-4dfd-8aa6-19d5bfc69e76	Cobran suscripción Google AI pro	2026-01-17	11:00	HIGH	NONE	\N	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	1440	\N	f	\N	f	Alvaro	2025-12-17 14:10:28.479553+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
e916023e-f3f7-41a7-ace6-15ca919486a8	Sommerferien	2026-07-27	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.104775+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
0bf07ec2-0932-44ea-bb2a-5ed0716de11d	Sommerferien	2026-07-21	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.022356+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
fae1bb7a-1c21-45d6-9cbc-0b382c31c753	Rutina Ariadna	2025-12-17	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	t	Alvaro	2025-12-16 06:23:43.049632+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
5985e92d-4db6-40ef-9f06-4aa1dd2501e2	Sommerferien	2026-07-31	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.111727+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3c1031c3-1186-4715-9a31-f167aa3a66ab	Database family planner will be deleted	2025-12-20	09:00	HIGH	NONE	Generar nueva conexión de pago en Hetzner cloud	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	1440	#ef4444	t	\N	t	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
9de6c469-b5c6-4fa7-a8bb-3f6eaa0724dc	Sommerferien	2026-08-04	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.113242+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
398bad1e-a370-42d5-96c0-2f1575430fe3	Sommerferien	2026-07-11	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.114403+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
e65ed817-9448-4e51-8e96-ef242c763a32	Sommerferien	2026-08-10	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.118608+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
ec5e78cb-f545-4973-b234-7426336c80a2	Sommerferien	2026-08-11	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.119265+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
bf57e887-1ce9-4a2a-86a8-f969836ac6de	Kita cierra	2026-07-21	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.315749+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
9321e6f6-eda0-4c1f-a5c7-e8144fe38ebc	Kita cierra	2026-08-02	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.402819+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
46bdf4bd-0b5f-43b2-a594-38229787275b	Kita cierra	2026-07-24	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.401757+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
0110277b-f566-4451-9266-7588f919f498	Kita cierra	2026-08-06	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.41415+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3126c755-5069-4940-82df-1048d4e90271	Kita cierra	2026-07-25	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.413137+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
e0515f6d-2ef1-4755-8829-9ce4efe9ef0f	Vacaciones navidad	2026-01-02	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	t	Alvaro	2025-12-15 10:00:02.197262+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
88e1b754-e342-4278-b180-c640e00c9299	Ir a la farmacia	2026-01-03	10:18	HIGH	NONE	Comprar ibuprofeno	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	60	\N	t	\N	f	Alvaro	2026-01-02 21:19:02.45204+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3bed86ef-dd39-4e79-b454-06eb1f490c4d	Vacaciones navidad	2026-01-05	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	t	Alvaro	2025-12-15 10:00:02.365461+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
99b7afcb-3adf-4132-8d63-d34ecb95eac6	Fin de antibiótico ariadna	2025-12-14	\N	HIGH	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-14 19:22:53.801031+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
eaf96f08-00d4-40b7-97a3-f2f49a66ed2d	Fiesta navidad Spielplatz	2025-12-14	15:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	1440	#22c55e	t	\N	t	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
7b810a76-b6e2-4b0a-a3db-ce3ac2f53613	Antibiótico Ariadna	2025-12-09	07:40	MEDIUM	NONE	Empezamos el día 6.12	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d3fc299f-4c24-4dd7-a82a-df8510a62a15	\N	\N	10	#a855f7	t	\N	t	\N	2025-12-09 06:30:22.250927+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
d4afd67c-487d-4094-9806-54508db01830	Vacaciones navidad	2025-12-28	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-15 10:00:02.487974+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
e3761356-5152-478d-bf12-4e0b2ab1696d	Crossfit	2025-12-15	17:00	MEDIUM	NONE	MTV	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	\N	\N	\N	60	#3b82f6	f	\N	f	Maria	2025-12-15 13:18:17.690403+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
48d445e4-2da3-493f-8567-fca45b322b0d	Antibiótico Ariadna	2025-12-12	19:30	HIGH	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	cfda59aa-1417-4919-9b37-eab6dfade5d3	\N	\N	10	#ec4899	t	\N	t	Alvaro	2025-12-11 12:57:34.147808+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
6495d66c-33cb-4ee7-b0bf-62a8c0b00db5	Rutina Ariadna	2025-12-12	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	ac7f0df7-1861-45dd-9d6e-3d19103d516d	\N	\N	10	\N	t	\N	t	Alvaro	2025-12-10 16:37:01.328165+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
df3a6c0f-9c44-4375-a698-aaef8fa8a7be	Kita cierra	2026-07-28	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.311502+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
ed1288f4-7fe3-4fa5-9b73-647f494653c7	Rutina Ariadna	2025-12-16	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:42.77812+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
b21eff9f-17b6-438d-9cbb-62d0c1b6de7a	Kita cierra	2026-07-22	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.318201+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
fcf3c16a-bb83-45c2-8ceb-5551d3cc2a47	Rutina Ariadna	2025-12-18	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	t	Alvaro	2025-12-16 06:23:42.951104+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
cbbb59dc-3d5d-4a88-9e23-9820993a3cb1	Kita cierra	2026-08-03	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.403284+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
1c3e3c71-ff86-4450-bff1-9e332c87decc	Test display	2025-12-09	00:05	MEDIUM	NONE	\N	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	10	\N	f	2025-12-09	\N	Alvaro	2025-12-09 22:53:07.20208+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
e025fd01-6e2a-43bd-a23b-1a45f279a463	Rutina Ariadna	2025-12-15	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	ac7f0df7-1861-45dd-9d6e-3d19103d516d	\N	\N	10	\N	f	\N	f	Alvaro	2025-12-10 16:37:01.402331+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
606cf627-a278-4855-83c6-1697c8582ff6	Acabar excel declaración renta	2025-12-21	21:10	HIGH	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	10	\N	t	\N	t	Alvaro	2025-12-21 14:26:35.044032+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
b9f92e71-00b9-455f-ac0e-d750e28348c2	Vacaciones navidad	2025-12-24	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	t	Alvaro	2025-12-15 10:00:02.397309+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
afd6a7eb-12c6-4ae1-9698-54303c70c714	Rutina Ariadna	2025-12-26	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:42.78478+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
c6292605-67c3-479f-b266-bd9e78987b2b	Kita cierra	2026-07-30	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.401575+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
cfd3ee73-e5aa-4fdf-907f-872e9a8d19f1	Kita cierra	2026-08-05	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.413594+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
cc6baa59-91ae-4272-bd2d-1b89d101546a	Rutina Ariadna	2025-12-27	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:42.79259+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3e2c09fd-4c9d-45ee-971f-143290230b5e	Rutina Ariadna	2025-12-28	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:42.837876+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
cf68bda1-55c3-4747-9433-fd7916e07d82	Rutina Ariadna	2025-12-29	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:42.851298+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
a5ff97ac-86de-4664-86f0-1246b0bb6bc0	Sommerferien	2026-07-09	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.020009+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
e19c853a-13b3-40fd-b937-2129efac3e97	Sommerferien	2026-07-04	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.103592+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
dbb2924e-53e5-4960-937b-9681ff6f0c43	Sommerferien	2026-07-23	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.102916+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
88ce35af-2497-43f4-ba9c-feb3159844d8	Sommerferien	2026-08-01	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.111748+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
29cf678d-5aa2-48ba-9820-89fe6d7120d0	Sommerferien	2026-08-02	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.113164+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
39ad00a4-3489-4330-a0e2-daedde23fe12	Sommerferien	2026-08-09	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.117151+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
19052475-390c-4cfb-b405-05869151d26f	Kita cierra	2026-08-07	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.413913+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3ca7fbb0-f863-484c-a4f2-1ac601c8a1a7	Kita cierra	2026-07-27	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.415497+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
6c0e708e-625e-44ac-ace7-908983375246	Rutina Ariadna	2025-12-30	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:42.862263+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
4c232c3c-f58a-4779-801b-600ac84f4e77	Rutina Ariadna	2025-12-31	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:42.869476+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
29e73416-4895-4afe-8db8-f2c52b8607a1	Caduca azureVPN	2026-02-06	12:00	MEDIUM	NONE	No seguir usando\nSi funciona bien cambiar el plan para más meses\nAhora sale a 5€ mensual . Opción de 4 o menos mensual	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	1440	\N	f	\N	\N	Alvaro	2026-01-06 21:07:24.338+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
ffbafc98-f64a-4ba7-8a9c-b511cada4a93	Actuación la gatita presumida	2026-01-02	18:00	MEDIUM	NONE	Teatro salamero	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	60	\N	t	\N	t	Alvaro	2026-01-01 15:07:53.684904+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
c8e458e6-46b0-47f3-9b39-8f04baf24991	Klausur SN 13	2026-02-23	09:30	HIGH	NONE	\N	[{"id": "mamaWork", "name": "Maria/Work", "color": "#c5e03aff"}]	\N	\N	\N	60	#f59e0b	f	2026-02-23	f	Maria	2026-01-06 11:10:43.66526+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
6c5c4f2f-5f1d-4256-a49d-cab91939ee00	Caduca licencia NORD VPN	2027-01-08	10:00	HIGH	NONE	Cancelar antes de que cobren el nuevo precio de 90€	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	1440	#ef4444	f	\N	f	Alvaro	2026-01-08 14:17:52.299631+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
84605954-b87b-4afe-bade-38651487b62f	HNO Ariadna segunda opinión	2026-02-18	09:25	HIGH	NONE	Frau Dr. med. Gisela Rösch\nAdolfstraße 65, 38102 Braunschweig	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	1440	#22c55e	f	\N	\N	Maria	2026-01-12 16:29:40.578+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
80cce45a-e65a-48d0-989f-01ea00da3809	Vacaciones navidad	2025-12-29	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-15 10:00:02.401072+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
33e0fa65-5dd2-44d0-bfd9-f5c6cf995a32	Rutina Ariadna	2025-12-11	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	ac7f0df7-1861-45dd-9d6e-3d19103d516d	\N	\N	10	\N	t	\N	t	Alvaro	2025-12-10 16:37:01.399891+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
fb62aa28-1013-40e1-94dd-a0a7067bc281	Actualizar XING…. Con portafolio visible	2025-12-12	11:00	MEDIUM	NONE	\N	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	\N	\N	f	\N	t	Alvaro	2025-12-12 06:25:13.324459+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
9f9a2730-5c40-4aec-aa7b-2fd6c40eaa0d	KA 11 neu	2025-12-16	09:25	MEDIUM	NONE	\N	[{"id": "mamaWork", "name": "Maria/Work", "color": "#c5e03aff"}]	\N	\N	\N	30	#f59e0b	t	\N	\N	Maria	2025-12-15 13:20:33.129+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
8ddcdabe-56d6-4181-b9ee-0c9141a77ce0	Lista para España	2025-12-21	\N	MEDIUM	NONE	-cámaras dormir\n-portátiles +  ipad +  cascos Ariadna \n-documentación DNI	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	\N	\N	f	\N	\N	Alvaro	2025-12-17 07:46:16.567+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
7d574344-2f05-4b6b-bbf1-98ba67a52fd5	Pedir lentillas	2026-01-06	21:10	MEDIUM	NONE	\N	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	10	\N	t	\N	t	Alvaro	2026-01-06 14:11:17.341195+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3a9efd72-9a23-47f4-9659-1678abb1a66a	Rutina Ariadna	2025-12-21	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	t	Alvaro	2025-12-16 06:23:42.946503+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
2f74549a-c80d-4a74-a43a-425c81e553a7	Asesor fiscal	2025-12-23	21:30	HIGH	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	60	#ef4444	t	2025-12-23	f	Maria	2025-12-23 16:54:14.554373+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
4f12e74b-df65-4778-b5a6-814e46bcb6d4	Rutina Ariadna	2025-12-25	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:42.953349+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
fe0b65d2-8149-4493-bb18-71cf0ef3bff7	Caduca licencia NordVPN	2026-01-07	10:00	HIGH	NONE	Pasarme mejor a wireguard, es más estable y rapida	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	1440	\N	t	2026-01-07	t	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
a500cde4-c675-465e-9f6e-89571b603290	Caduca dominio cloudflare	2027-01-08	11:00	HIGH	NONE	apartamentoalohadelta.com	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	1440	#ef4444	f	\N	f	Alvaro	2026-01-08 19:24:25.403255+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
125bff89-49b9-49dd-abce-e3ae3e895e62	Vacaciones navidad	2025-12-27	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	t	Alvaro	2025-12-15 10:00:02.494192+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
504358cc-0743-4dfe-a946-9c3592aba337	Sommerferien	2026-07-07	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.021362+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
accba449-38a9-45f9-9de0-8d9a5231ff68	Sommerferien	2026-07-25	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.102043+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
f0f7e026-ad9e-40e5-8f50-d9b878dc3504	Sommerferien	2026-07-08	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.100879+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
e40b5510-b05d-4983-bba1-900780983d2b	Sommerferien	2026-07-30	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.107711+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
cb3328d1-1afd-441e-9056-c11d3c359ddc	Sommerferien	2026-08-05	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.113553+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
1d48629c-3920-4a45-b34e-19ff454f8119	Sommerferien	2026-08-07	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.113709+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
8826df7d-7815-4ae8-aa37-1be22bc5c456	Kita cierra	2026-07-26	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.314004+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
a8e9ec41-7d2b-4d63-82ba-14aca2ca824c	Kita cierra	2026-07-31	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.401714+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
0982977a-4882-4add-865f-1fd4b236122d	Kita cierra	2026-07-23	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.403681+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3fb35d59-9263-421f-868e-44dd22133e4d	Kita cierra	2026-08-04	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.411439+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
0043c259-1fcf-4dfd-939c-04396424a3cb	Kita cierra	2026-07-29	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.413345+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
59a81fd1-ec16-44fe-ae48-762c808e7002	Kita/krippe cierra	2026-05-15	11:00	HIGH	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	1440	\N	f	\N	f	Alvaro	2025-12-30 09:58:03.470885+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
b151c302-cd17-4f73-9b7f-c271b6f41c11	Partido pádel	2026-01-02	19:30	MEDIUM	NONE	\N	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	\N	\N	f	\N	t	Alvaro	2026-01-02 08:44:00.608661+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
4a03cfe1-70c4-47c9-8a95-df977f253a85	Análisis sangre María	2026-01-12	09:15	MEDIUM	NONE	Doctor joachim weber	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	\N	\N	\N	60	\N	t	\N	t	Alvaro	2025-12-17 09:10:18.709578+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
7baa0667-a1bc-49be-8ae7-370cad1800d1	Dermatólogo Alvaro	2026-06-22	17:30	HIGH	NONE	Vorsorgeuntersuchung	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	60	#14b8a6	f	\N	f	Alvaro	2026-01-13 15:07:18.021102+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
85b29052-f82f-4490-9ea0-8f3686f9a094	Dermatólogo	2026-06-22	17:30	MEDIUM	NONE	Friedrich-Wilhelm-Straße 42, 38100 Braunschweig	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	1440	#3b82f6	f	\N	f	Maria	2026-01-13 14:59:24.384594+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
aa95d75b-5375-44f9-b4c3-c74edd672e22	Elterngespräch	2026-01-13	13:00	HIGH	NONE	\N	[{"id": "mamaWork", "name": "Maria/Work", "color": "#c5e03aff"}]	\N	\N	\N	30	#f97316	t	\N	t	Maria	2026-01-13 09:51:52.5313+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
ae7f8953-64ea-4f21-9dc3-4b5654e671be	Dermatólogo Maria	2026-01-13	14:30	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	60	#3b82f6	t	\N	t	Maria	2026-01-13 09:51:01.730737+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
27136038-b689-4700-bd8d-fb6d17194fa2	Repostar	2026-01-13	21:00	HIGH	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	\N	\N	\N	30	#ef4444	t	\N	t	Maria	2026-01-13 15:00:31.567024+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
53f71aaa-de80-480f-81f3-cf839300b4fb	Zeugniskonferenzen	2026-01-14	13:30	HIGH	NONE	Hasta 17:30	[{"id": "mamaWork", "name": "Maria/Work", "color": "#c5e03aff"}]	\N	\N	\N	60	#ef4444	t	\N	f	Maria	2026-01-13 15:03:51.390157+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
b9f3b988-c3a2-4742-bed0-19b408a42ee9	Recoger resultados análisis	2026-01-15	11:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	60	\N	t	\N	\N	Alvaro	2026-01-12 16:48:54.532+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
d36aaf8c-c7b2-4721-9917-a7a3fc928cea	Mini-Sportabzeichen Vogelgruppe	2026-01-08	09:30	MEDIUM	NONE	in der Turnhalle eine kleine Bewegungsaktion	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	1440	\N	t	\N	f	Alvaro	2025-12-12 08:51:12.904375+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
bf35eda8-4fdc-44be-bd2d-b4c82bdd8aa5	Rutina Ariadna	2025-12-08	19:45	HIGH	NONE	\N	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	fdadb242-da00-41dc-849a-26bdcb12e399	\N	\N	10	#a855f7	t	\N	\N	\N	2025-12-08 17:25:24.222313+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
a4e1e3fb-75d1-4635-b87d-3df5f5f7d668	Rutina Ariadna	2025-12-13	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	ac7f0df7-1861-45dd-9d6e-3d19103d516d	\N	\N	10	\N	t	\N	t	Alvaro	2025-12-10 16:37:01.400143+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
6f608901-2c71-4f2c-8ede-4dd920a8b6fd	Configurar debug	2025-12-11	\N	LOW	NONE	\N	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	\N	\N	f	\N	t	Alvaro	2025-12-11 06:35:32.364679+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
c2d9992b-5859-415b-991c-c6fd6ec1b15d	Hora de entrenar Ring	2025-12-10	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	t	\N	t	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
07731b27-d950-4747-a33b-41b4f4d49f64	Vacaciones navidad	2025-12-25	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-15 10:00:02.404375+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3d31f9b8-6690-4c87-8a20-a67069406de0	Test notificación	2025-12-04	14:50	MEDIUM	NONE	14:40 tiene que llegar	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	10	#14b8a6	t	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
9fdcbf3b-5d3f-4db2-8c03-735c1acbba82	Mandar Bewerbung	2025-12-04	16:00	HIGH	NONE	A y 50	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	10	#14b8a6	t	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
63cce33d-b06b-4e6d-96f2-f8669c1e0c25	Vacaciones navidad	2025-12-23	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-15 10:00:02.496057+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
e91470e8-1514-42e2-bd7f-dbc71cffb881	Hora de entrenar Ring	2025-12-04	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	f	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
61d28c48-180f-4d85-ae44-ed4dce19f482	Hora de entrenar Ring	2025-12-08	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	f	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
dbb2dc80-95ab-481e-ad5f-65d899a1bdf1	Hora de entrenar Ring	2025-12-18	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	t	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
c0c1e1fa-2c46-4605-8622-240ec60f6fe6	Análisis sangre Alvaro	2026-01-12	09:00	MEDIUM	NONE	Doctor joachim weber	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	60	\N	t	2026-01-12	t	Alvaro	2025-12-17 09:09:30.973115+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
a530eff3-1297-41c5-a9b2-6d300144506f	Hora de entrenar Ring	2025-12-16	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	f	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
697c934a-07f0-4947-bb23-67d3f49e0d36	Hora de entrenar Ring	2025-12-19	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	t	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
2cd95545-7e8f-41c7-9564-33996cea5d86	Rutina Ariadna	2025-12-20	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:42.947295+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
e7a3cfed-20a5-4a1d-874a-bad6f164a419	Llevar a Rocco Hundesitterin	2025-12-21	20:30	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	\N	#22c55e	f	\N	t	Alvaro	2025-12-15 14:15:41.399306+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
7b5e35c4-4a32-4f2f-a168-448a29c9bbc0	Rutina Ariadna	2025-12-23	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:43.047135+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
b2fc3c01-5fdc-47a4-8e4d-456b86902059	Hora de entrenar Ring	2025-12-05	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	t	\N	t	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
14d70167-8813-4d4f-ac4f-42c34dd3687b	Sommerferien	2026-07-02	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:40.637596+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
16457265-b333-4a80-8a80-0fce0601c6e4	Sommerferien	2026-07-12	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:40.644267+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
4aadc758-4f8b-4056-84c2-1e4409a080e8	Sommerferien	2026-07-13	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:40.651693+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
ae90f697-f74d-445f-a419-22c328fec130	Sommerferien	2026-07-14	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:40.65736+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
824b838c-1c41-43cd-98d1-8f4b7de10e10	Sommerferien	2026-07-15	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:40.668279+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
cba695b7-a09a-4aeb-b3b6-a6bb6319f8c1	Documentación renta la rapita	2025-12-13	20:40	HIGH	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	\N	\N	\N	10	\N	t	2025-12-13	\N	Alvaro	2025-12-13 14:17:23.858868+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
71edb0d1-d86d-4285-8c5c-9fcd9e1aca32	Comida Huesca	2025-12-27	14:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	1440	#3b82f6	t	\N	t	Alvaro	2025-12-15 14:18:38.233556+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
5c419bb0-f14d-46d7-a4b6-186e3ce98be6	Rutina Ariadna	2025-12-14	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	ac7f0df7-1861-45dd-9d6e-3d19103d516d	\N	\N	10	\N	t	\N	t	Alvaro	2025-12-10 16:37:01.401228+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
2c82ac16-c7de-435c-964b-c51c05b14be5	Hora de entrenar Ring	2025-12-11	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	t	\N	t	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
d11dc430-201f-45ca-a77d-93d4b701a630	test maria work	2025-12-14	\N	MEDIUM	NONE	\N	[{"id": "mamaWork", "name": "Maria/Work", "color": "#c5e03aff"}]	\N	\N	\N	\N	\N	f	\N	f	Maria	2025-12-14 19:50:34.353311+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
6494580a-e8ba-427a-ba29-8ca983756ac7	Antibiótico Ariadna	2025-12-11	19:30	HIGH	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	cfda59aa-1417-4919-9b37-eab6dfade5d3	\N	\N	10	#ec4899	t	\N	t	Alvaro	2025-12-11 12:57:34.076386+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
b4066c40-aad9-43f6-b767-a87d11cb20e4	Hora de entrenar Ring	2025-12-09	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	t	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
98bb2521-7591-4ae0-bc17-4290124f8462	Sommerferien	2026-07-16	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:40.70531+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
6b23eb91-3a61-4419-bd63-9bcff59decc7	Sommerferien	2026-07-17	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:40.715921+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
e20915f0-886a-48d9-b968-0058373b1037	Oftalmologo Leo	2026-01-26	10:00	HIGH	NONE	Augenarzt, Schlosscarree\nLlevar resultados del pediatra	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	1440	#3b82f6	f	2026-01-26	f	Alvaro	2025-12-10 12:38:39.403885+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
ab861c77-9ed7-4c60-90df-111a764c7369	Hora de entrenar Ring	2025-12-15	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	t	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3155c316-8d64-447f-9b41-bd3001ba3c6e	Sommerferien	2026-07-18	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:40.721649+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3a41257d-3b4d-4fed-bf6e-9d1bda6c9654	Vacaciones navidad	2025-12-30	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-15 10:00:02.486605+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
56ca82ed-f70c-43aa-8459-d70620e986b5	Hora de entrenar Ring	2025-12-12	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	t	\N	t	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
752a8114-6a65-4d01-96c0-49823ff468ec	Sommerferien	2026-07-19	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:40.90098+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
a9f007d1-bc10-477d-be80-268494d0de5f	Vacaciones navidad	2025-12-26	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-15 10:00:02.496762+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
d45aad82-3824-4238-a8cb-a33b2a9d19ee	Entregar libros biblioteca	2026-01-19	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	\N	\N	\N	1440	\N	f	2025-12-16	\N	familia	2025-12-08 10:28:01.333+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
492a90bc-f76a-4741-a5cd-68e8ce539dea	Hora de entrenar Ring	2025-12-17	10:00	MEDIUM	CUSTOM_WEEKLY	Hacer ejercicios con Nintendo	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	256cad6d-b675-4199-8f2e-40ee03319174	{1,3,2,4,5}	4	10	#f59e0b	t	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
dc4615ff-7b37-4ecf-8aef-25b22d6c888d	Llamar fisio elesar	2025-12-05	11:30	LOW	NONE	Graus	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	10	\N	t	\N	t	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
b0f78cde-4e53-442e-8a08-6ddc8583cb69	Rutina Ariadna	2025-12-19	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:42.945999+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
cc606f65-f831-48b0-b608-19d24cd24d51	Rutina Ariadna	2025-12-22	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:43.049987+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
f67abe9d-fd28-4550-9957-dc838c56e0e9	Sommerferien	2026-07-20	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.007517+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
9a2f943a-2241-439e-9fb5-e59be619f9e9	Fisio Alvaro	2025-12-24	10:00	MEDIUM	NONE	\N	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	30	\N	t	\N	t	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
66660ce6-b594-4e83-9907-1424552a8858	TESTING COLORES	2025-11-30	22:36	MEDIUM	NONE	ghfghgfh	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	\N	#ef4444	f	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
555f699d-4b8c-4f7b-a85b-9ec12afdf867	Rutina Ariadna	2025-12-24	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	9b9d1dd8-0cd2-4479-9a90-3dd5f7da4126	\N	\N	10	#a855f7	t	\N	f	Alvaro	2025-12-16 06:23:42.950421+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
9070f70b-a014-46db-9ea0-084283a937d0	Sommerferien	2026-07-05	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.018763+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
9377e65e-4fbf-4f71-8c8b-6dd0a9113b91	Peli	2025-11-29	22:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Todos", "color": "#6366f1"}]	\N	\N	\N	\N	\N	f	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
01f9a4ca-da1f-4ed5-83cf-bc5caafd8eac	Knabberteller	2025-11-30	18:05	HIGH	NONE	Plátanos y zanahorias	[{"id": "familia", "name": "Todos", "color": "#6366f1"}]	\N	\N	\N	10	\N	f	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
b4a1eaf7-571b-46fd-b412-620af9d1bde4	Turnen Ariadna	2025-11-29	15:37	MEDIUM	NONE	\N	[{"id": "familia", "name": "Todos", "color": "#6366f1"}]	\N	\N	\N	\N	\N	f	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
eab4af1c-cdf1-4511-9ec8-d522047d7d73	Antibiótico Ariadna	2025-12-13	19:30	HIGH	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	cfda59aa-1417-4919-9b37-eab6dfade5d3	\N	\N	10	#ec4899	t	\N	f	Alvaro	2025-12-11 12:57:34.146363+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
3f375e32-152e-4107-969f-2f75a965cd26	Rutina Ariadna 2	2025-12-08	20:05	MEDIUM	NONE	\N	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	10	\N	t	\N	\N	Alvaro	2025-12-08 18:33:03.540143+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
f5480ae4-3f8c-49ea-8680-d3c08596ad28	Ir a buscar candado patinete	2025-12-14	\N	HIGH	NONE	\N	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	\N	\N	f	\N	t	Alvaro	2025-12-14 13:01:12.134011+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
e94f6823-73f4-4c4e-97ad-8208cd28fd92	Vacaciones navidad	2025-12-22	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-15 10:00:02.004882+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
181b2a2e-6425-4148-9a4c-342a6c81b710	Vacaciones navidad	2026-01-01	10:00	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	d4f4aa43-0574-4ca9-ae5f-76fd4e8dc0a8	\N	\N	\N	\N	f	\N	f	Alvaro	2025-12-15 10:00:02.098374+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
31f9e0e9-3bc7-40b1-b5f1-9fdf4466e626	Rutina Ariadna	2025-12-10	19:10	HIGH	NONE	Higiene	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	ac7f0df7-1861-45dd-9d6e-3d19103d516d	\N	\N	10	\N	t	\N	t	Alvaro	2025-12-10 16:37:01.401614+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
6bf45467-fadd-4186-ab2d-8ce859a16687	CrossFit	2025-12-10	17:00	HIGH	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	\N	\N	\N	\N	#3b82f6	f	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
227b8230-77a9-4be6-a44d-be1ff0d9d1eb	Editar notas	2025-12-04	09:30	HIGH	NONE	\N	[{"id": "papa", "name": "Alvaro", "color": "#22c55e"}]	\N	\N	\N	10	\N	f	\N	f	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
ea8b9c06-0897-49a5-8d1e-202ab5992367	Fisio María	2025-12-24	11:30	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	\N	\N	\N	30	\N	t	\N	t	\N	2025-12-08 10:28:01.333566+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
a4ab7d21-1965-44f5-bb97-ca10839a2c59	Kita cierra	2026-07-20	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.31468+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
73443a7c-0440-4e3b-9d3a-ca46156479fc	Sommerferien	2026-07-06	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.023069+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
83fd1f0f-98bb-41e8-8759-6f66ea368841	Sommerferien	2026-07-24	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.1009+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
61d3de56-bc3f-44cf-8a42-ddfbb890e389	Sommerferien	2026-07-26	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.101638+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
08559724-1c8f-498f-8758-4d84f04ac0b7	Sommerferien	2026-07-10	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.10299+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
7704d2d5-a319-4e7f-94ef-8a0340dba4b0	Sommerferien	2026-07-28	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.106632+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
dc5062c3-9342-4ef1-966d-1af4cbdd1f42	Sommerferien	2026-07-29	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.107744+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
99f5726c-e021-4574-bc83-9f5277e7409a	Sommerferien	2026-08-03	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.113149+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
9c7c17d2-8bb2-4ea4-a08e-2aae6886391f	Sommerferien	2026-08-06	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.113835+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
1a82aeef-3ab4-4c00-b3ac-397b18e66167	Sommerferien	2026-08-08	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.114048+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
a70651e3-08ef-4a65-b41a-a573b37e887a	Sommerferien	2026-08-12	\N	MEDIUM	NONE	\N	[{"id": "mama", "name": "Maria", "color": "#f97316"}]	5212f0bc-e667-4782-a137-5edd3ff7634b	\N	\N	\N	#22c55e	f	\N	f	Alvaro	2025-12-30 09:54:41.119277+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
f8233ee4-4d71-47c5-88ad-4c5873b5f9ee	Kita cierra	2026-08-01	\N	MEDIUM	NONE	\N	[{"id": "familia", "name": "Familia", "color": "#6366f1"}]	0ebc5762-b4b9-4ea4-888f-0b2c3204dbb6	\N	\N	\N	#f97316	f	\N	f	Alvaro	2025-12-30 09:56:35.402423+00	0acd1a29-c7c5-4445-8027-7b8607f65a92
\.


--
-- Name: shopping_favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shopping_favorites_id_seq', 4, true);


--
-- Name: shopping_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shopping_items_id_seq', 4, true);


--
-- Name: family_members family_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_pkey PRIMARY KEY (id);


--
-- Name: family_wall_notes family_wall_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_wall_notes
    ADD CONSTRAINT family_wall_notes_pkey PRIMARY KEY (id);


--
-- Name: households households_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.households
    ADD CONSTRAINT households_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: shopping_favorites shopping_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_favorites
    ADD CONSTRAINT shopping_favorites_pkey PRIMARY KEY (id);


--
-- Name: shopping_items shopping_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_items
    ADD CONSTRAINT shopping_items_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: households unique_household_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.households
    ADD CONSTRAINT unique_household_name UNIQUE (name);


--
-- Name: family_members family_members_household_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_household_id_fkey FOREIGN KEY (household_id) REFERENCES public.households(id);


--
-- Name: push_subscriptions push_subscriptions_family_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_family_member_id_fkey FOREIGN KEY (family_member_id) REFERENCES public.family_members(id);


--
-- Name: push_subscriptions push_subscriptions_household_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_household_id_fkey FOREIGN KEY (household_id) REFERENCES public.households(id);


--
-- Name: shopping_favorites shopping_favorites_household_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_favorites
    ADD CONSTRAINT shopping_favorites_household_id_fkey FOREIGN KEY (household_id) REFERENCES public.households(id);


--
-- Name: shopping_items shopping_items_household_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_items
    ADD CONSTRAINT shopping_items_household_id_fkey FOREIGN KEY (household_id) REFERENCES public.households(id);


--
-- Name: tasks tasks_household_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_household_id_fkey FOREIGN KEY (household_id) REFERENCES public.households(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict M3B1YTS9JJI0gJYfVval25mKIRKo9dHuXSZoxjrPXloCDgP9kT1641jEGLr55yn

