--
-- PostgreSQL database dump
--

\restrict lBAFJ5WJywfG4gkkdFxNE7tAtk2Hpd4dvOZToeIJ1X1ncZfAzo5gi8dXObbbbGl

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg12+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Addresses" (
    "Id" uuid NOT NULL,
    "Address1" text NOT NULL,
    "Address2" text,
    "City" text NOT NULL,
    "State" text NOT NULL,
    "Country" text NOT NULL,
    "PostalCode" text NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: Branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Branches" (
    "Id" uuid NOT NULL,
    "GymId" uuid NOT NULL,
    "Name" text NOT NULL,
    "AddressId" uuid NOT NULL,
    "ContactNumber" text,
    "IsMainBranch" boolean NOT NULL,
    "IsActive" boolean NOT NULL,
    "OpenTime" text,
    "CloseTime" text,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: Equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Equipment" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "SerialNumber" text NOT NULL,
    "Category" text NOT NULL,
    "PurchaseDate" timestamp with time zone NOT NULL,
    "WarrantyExpiry" timestamp with time zone,
    "CurrentCondition" text NOT NULL,
    "HealthPercentage" integer NOT NULL,
    "MaintenanceIntervalMonths" integer NOT NULL,
    "LastServiceDate" timestamp with time zone,
    "GymId" uuid NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid,
    "ImageUrl" text,
    "IsInMaintenance" boolean DEFAULT false NOT NULL
);


--
-- Name: GymMembers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GymMembers" (
    "Id" uuid NOT NULL,
    "GymId" uuid NOT NULL,
    "MembershipNumber" text NOT NULL,
    "FirstName" text NOT NULL,
    "LastName" text NOT NULL,
    "Email" text NOT NULL,
    "PhoneNumber" text NOT NULL,
    "DateOfBirth" timestamp with time zone NOT NULL,
    "Gender" integer NOT NULL,
    "ProfilePictureUrl" text,
    "EmergencyContactName" text,
    "EmergencyContactPhone" text,
    "JoiningDate" timestamp with time zone NOT NULL,
    "Status" integer NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid,
    "AddressId" uuid,
    "BloodGroup" text,
    "FitnessGoals" text[],
    "MedicalConditions" text,
    "UserId" uuid
);


--
-- Name: GymPlans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GymPlans" (
    "Id" uuid NOT NULL,
    "GymOwnerId" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "Price" numeric(18,2) NOT NULL,
    "DurationMonths" integer NOT NULL,
    "MaxBranches" integer,
    "Features" text[],
    "IsActive" boolean NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid,
    "DiscountedPrice" numeric(18,2),
    "ExtendedMonths" integer,
    "IsOffer" boolean DEFAULT false NOT NULL
);


--
-- Name: Gyms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Gyms" (
    "Id" uuid NOT NULL,
    "GymName" text NOT NULL,
    "BrandName" text,
    "Email" text,
    "Phone" text,
    "WebsiteUrl" text,
    "GstNumber" text,
    "RegistrationNumber" text,
    "EstablishedDate" timestamp with time zone,
    "OwnerUserId" uuid NOT NULL,
    "AddressId" uuid,
    "LogoUrl" text,
    "BannerUrl" text,
    "Description" text,
    "IsActive" boolean NOT NULL,
    "IsVerified" boolean NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: InventoryItems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InventoryItems" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "SKU" text NOT NULL,
    "Category" text NOT NULL,
    "Description" text,
    "BuyingPrice" numeric(18,2) NOT NULL,
    "SellingPrice" numeric(18,2) NOT NULL,
    "StockQuantity" integer NOT NULL,
    "ReorderLevel" integer NOT NULL,
    "IsActive" boolean NOT NULL,
    "GymId" uuid NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid,
    "ImageUrl" text
);


--
-- Name: MaintenanceLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MaintenanceLogs" (
    "Id" uuid NOT NULL,
    "ServiceType" text CONSTRAINT "MaintenanceLogs_TaskName_not_null" NOT NULL,
    "Description" text NOT NULL,
    "TechnicianName" text CONSTRAINT "MaintenanceLogs_AssignedTo_not_null" NOT NULL,
    "ScheduledDate" timestamp with time zone NOT NULL,
    "CompletedDate" timestamp with time zone,
    "Status" text NOT NULL,
    "Notes" text,
    "EquipmentId" uuid NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid,
    "Cost" numeric DEFAULT 0.0 NOT NULL,
    "EstimatedEndDate" timestamp with time zone
);


--
-- Name: MemberMeasurements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MemberMeasurements" (
    "Id" uuid NOT NULL,
    "MemberId" uuid NOT NULL,
    "RecordedById" uuid,
    "Weight" double precision,
    "Height" double precision,
    "BodyFatPercentage" double precision,
    "BMI" double precision,
    "Notes" text,
    "Date" timestamp with time zone NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: MemberSubscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MemberSubscriptions" (
    "Id" uuid NOT NULL,
    "MemberId" uuid NOT NULL,
    "GymPlanId" uuid NOT NULL,
    "PlanNameSnapshot" text NOT NULL,
    "PricePaid" numeric NOT NULL,
    "DurationMonths" integer NOT NULL,
    "ExtendedMonths" integer NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "IsActive" boolean NOT NULL,
    "PaymentStatus" integer NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid,
    "IsComplementary" boolean DEFAULT false NOT NULL
);


--
-- Name: PTAssignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PTAssignments" (
    "Id" uuid NOT NULL,
    "TrainerId" uuid NOT NULL,
    "MemberId" uuid NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone,
    "SessionFrequency" text,
    "PreferredSlot" text,
    "IsActive" boolean NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: Plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Plans" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "Price" numeric(18,2) NOT NULL,
    "DurationInDays" integer NOT NULL,
    "MaxBranches" integer,
    "MaxMembers" integer,
    "IsActive" boolean NOT NULL,
    "IsTrial" boolean NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: RefreshTokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RefreshTokens" (
    "Id" uuid NOT NULL,
    "Token" text NOT NULL,
    "Expires" timestamp with time zone NOT NULL,
    "Revoked" timestamp with time zone,
    "GracePeriodExpires" timestamp with time zone,
    "ReplacedByToken" text,
    "UserId" uuid NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: SaaSConfigurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SaaSConfigurations" (
    "Id" uuid NOT NULL,
    "PlatformName" character varying(100) NOT NULL,
    "BillingEmail" text NOT NULL,
    "TaxPercentage" numeric(5,2) NOT NULL,
    "GracePeriodDays" integer NOT NULL,
    "Currency" text NOT NULL,
    "BillingAddress" text,
    "SupportPhone" text,
    "SupportEmail" text,
    "IsMaintenanceMode" boolean NOT NULL,
    "TermsUrl" text,
    "PrivacyUrl" text,
    "MaintenanceStartTime" timestamp with time zone,
    "MaintenanceEndTime" timestamp with time zone,
    "MonthlyRevenueTarget" numeric(18,2) NOT NULL,
    "SubscriptionTarget" integer NOT NULL,
    "UptimeThreshold" numeric(5,2) NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: SaaSPaymentTransactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SaaSPaymentTransactions" (
    "Id" uuid NOT NULL,
    "GymId" uuid NOT NULL,
    "SubscriptionId" uuid NOT NULL,
    "Amount" numeric(18,2) NOT NULL,
    "Currency" text NOT NULL,
    "Status" text NOT NULL,
    "GatewayTransactionId" text NOT NULL,
    "GatewayResponse" text,
    "FailureReason" text,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: SaleTransactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SaleTransactions" (
    "Id" uuid NOT NULL,
    "MemberId" uuid NOT NULL,
    "InventoryItemId" uuid NOT NULL,
    "Quantity" integer NOT NULL,
    "UnitPrice" numeric(18,2) NOT NULL,
    "TotalAmount" numeric(18,2) NOT NULL,
    "PaymentMethod" text NOT NULL,
    "TransactionDate" timestamp with time zone NOT NULL,
    "GymId" uuid NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: Staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Staff" (
    "Id" uuid NOT NULL,
    "GymId" uuid NOT NULL,
    "StaffNumber" text NOT NULL,
    "FirstName" text NOT NULL,
    "LastName" text NOT NULL,
    "Email" text NOT NULL,
    "PhoneNumber" text NOT NULL,
    "UserId" uuid,
    "Role" integer NOT NULL,
    "ProfilePictureUrl" text,
    "Specializations" text[],
    "Bio" text,
    "ExperienceYears" integer,
    "InstagramUrl" text,
    "PortfolioUrl" text,
    "ShiftTimings" text,
    "IsActive" boolean NOT NULL,
    "JoiningDate" timestamp with time zone NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: SubscriptionRecords; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SubscriptionRecords" (
    "Id" uuid NOT NULL,
    "GymId" uuid NOT NULL,
    "PlanId" uuid NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "IsActive" boolean NOT NULL,
    "IsTrial" boolean NOT NULL,
    "PriceAtPurchase" numeric(18,2) NOT NULL,
    "Notes" text,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: Users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Users" (
    "Id" uuid NOT NULL,
    "FirstName" text NOT NULL,
    "LastName" text NOT NULL,
    "Email" text NOT NULL,
    "Phone" text NOT NULL,
    "PasswordHash" text,
    "GymId" uuid,
    "AddressId" uuid,
    "ProfilePictureUrl" text NOT NULL,
    "Role" integer NOT NULL,
    "IsActive" boolean NOT NULL,
    "InvitationToken" text,
    "InvitationExpiry" timestamp with time zone,
    "IsInvitationAccepted" boolean NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


--
-- Data for Name: Addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Addresses" ("Id", "Address1", "Address2", "City", "State", "Country", "PostalCode", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
5d33044b-f4fc-4dfa-e777-08dea39056ef	Se 5/A, 1269/2 Gandhinagar, Gujarat	\N	Gandhinagar	Gujarat		382007	2026-04-26 07:14:46+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-27 02:23:25+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
019dda86-48a8-7d09-a62f-c5b456c5a8d6			Gandhinagar	Gujarat	India	382007	2026-04-29 18:35:27.065376+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:35:27.065376+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
d7f88a13-9c0c-4533-84db-0854b9ddbf6f			Gandhinagar	Gujarat	India	382007	2026-04-29 18:35:27.065371+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:35:27.065371+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
f797397e-8dff-425c-88f3-bdcf272ec140			Gandhinagar	Gujarat	India	382007	2026-04-29 18:35:27.065342+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:35:27.065342+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
019df900-dae5-7748-a07a-5bbdcd2cce2b	Se 5/A, 1269/2 Gandhinagar, Gujarat	\N	Gandhinagar	Gujarat	India	382007	2026-05-05 16:37:56.137014+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-05 16:37:56.137014+00	019dda81-85f0-7db5-bb97-8eb9853f4687
019dfe95-73ae-753c-8e4f-f7e8cb414bc6	Bleeker Street 16 A	\N	LA		US		2026-05-06 18:38:20.61074+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-06 18:38:20.61074+00	019dda81-85f0-7db5-bb97-8eb9853f4687
019e003d-ce37-78eb-b1d8-62d0047ef6c8	12th Street park avenue	\N	Star city	CS	US		2026-05-07 02:21:51.051752+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 02:21:51.051752+00	019dda81-85f0-7db5-bb97-8eb9853f4687
4a5e2e8d-f3dd-4db6-84f8-675b09d7d293	Sector 5/A Plot no.1269/2 Gandhinagar, Gujarat	\N	Gandhinagar	Gujarat		382006	2026-05-09 07:34:07.789156+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 07:34:27.829259+00	019dda81-85f0-7db5-bb97-8eb9853f4687
41606115-9e61-448f-950e-c0db701eefca	st. 12 down street 	\N	LA		US		2026-05-16 11:35:49.201289+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:35:49.201289+00	019dda81-85f0-7db5-bb97-8eb9853f4687
06c19fd0-eece-4aab-aadc-887619144420	15th street new downtown 	\N	Alabama	Alabama	US		2026-05-16 11:40:53.452259+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:40:53.452259+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- Data for Name: Branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Branches" ("Id", "GymId", "Name", "AddressId", "ContactNumber", "IsMainBranch", "IsActive", "OpenTime", "CloseTime", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
78c8547b-0380-4525-9603-c9551dfd64ff	472d8778-9a41-490d-aba9-3ccb02ab3ff3	Suman City Branch	019dda86-48a8-7d09-a62f-c5b456c5a8d6	07383052505	t	t	06:00	22:00	2026-04-29 18:35:27.065374+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:35:27.065374+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
\.


--
-- Data for Name: Equipment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Equipment" ("Id", "Name", "SerialNumber", "Category", "PurchaseDate", "WarrantyExpiry", "CurrentCondition", "HealthPercentage", "MaintenanceIntervalMonths", "LastServiceDate", "GymId", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "ImageUrl", "IsInMaintenance") FROM stdin;
019e1131-0b4e-7f58-b271-d79154ddf40f	Matrix Treadmill Trex #2	SN-98263721	Cardio	2026-05-10 00:00:00+00	2027-05-10 00:00:00+00	Excellent	100	6	\N	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-10 14:51:27.375083+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 10:40:22.736517+00	019dda81-85f0-7db5-bb97-8eb9853f4687	https://res.cloudinary.com/dy1fcodtg/image/upload/v1778409619/gymforge/equipment/9dc5930c-f1cc-4f85-926e-b04838bfbe88_TAC-2000-Treadmill.jpg	f
019e1127-d0f0-779b-b165-9b249b5c9511	Matrix Treadmill Trex #1	SN-78451215	Cardio	2026-05-11 05:30:00+00	2026-10-10 05:30:00+00	Excellent	100	6	2026-05-10 00:00:00+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-12 10:41:22.630124+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 12:48:47.319953+00	019dda81-85f0-7db5-bb97-8eb9853f4687	https://res.cloudinary.com/dy1fcodtg/image/upload/v1778408906/gymforge/equipment/e7b1f3d3-c885-44df-9e8a-087c7f6911fe_TAC-2000-Treadmill.jpg	f
019e1a2d-98a0-7ce7-967f-b938ce3ddb26	Smith Machine	SM-784514	Strength	2026-05-12 00:00:00+00	2027-05-12 00:00:00+00	Excellent	100	6	2026-05-12 00:00:00+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-12 03:14:16.451038+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-12 03:16:46.950305+00	019dda81-85f0-7db5-bb97-8eb9853f4687	https://res.cloudinary.com/dy1fcodtg/image/upload/v1778555654/gymforge/equipment/fb6c12de-407d-4f5d-8f21-a27a8d759e1a_smith_machine.jpg	f
\.


--
-- Data for Name: GymMembers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GymMembers" ("Id", "GymId", "MembershipNumber", "FirstName", "LastName", "Email", "PhoneNumber", "DateOfBirth", "Gender", "ProfilePictureUrl", "EmergencyContactName", "EmergencyContactPhone", "JoiningDate", "Status", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "AddressId", "BloodGroup", "FitnessGoals", "MedicalConditions", "UserId") FROM stdin;
019e309e-c26a-795a-8156-3c9a3fa04701	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-13699679	Darrell	Henderson	DarrellPHenderson@teleworm.us	47500861	1998-08-14 00:00:00+00	1	\N	\N	\N	2026-05-16 17:19:31.369967+00	1	2026-05-16 17:19:31.370521+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:49:43.428307+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	B+	{"Muscle Gain","Weight Loss","Strength & Conditioning"}	\N	\N
019dfe95-73ad-70b5-a585-ee4e4653d314	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-05808369	Shawn	Levis	shawn.levis@gmail.com	9887655465	2004-02-03 00:00:00+00	1	\N	\N	\N	2026-05-08 14:38:20.580792+00	1	2026-05-08 14:38:20.610724+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 02:17:55.419722+00	019dda81-85f0-7db5-bb97-8eb9853f4687	019dfe95-73ae-753c-8e4f-f7e8cb414bc6	B+	{"Muscle Gain","Strength & Conditioning","Weight Loss"}	\N	\N
019e309f-d28b-7c2e-880b-b88f9ef8079b	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-10354375	Jess	Cotton	jesscotton@gmail.com	784512895	2000-04-01 00:00:00+00	2	\N	\N	\N	2026-05-16 11:50:41.035437+00	1	2026-05-16 11:50:41.035866+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:50:41.035866+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	AB+	{"Sports Training"}	\N	\N
019e003d-ce36-77b0-9a77-a3c7d7c3caee	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-10207700	Barry	Allan	barry.allan@gmail.com	9898653212	2000-12-05 00:00:00+00	1	\N	Neel Parghi	7878898945	2026-05-07 02:21:51.02066+00	1	2026-05-07 02:21:51.051738+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 09:49:30.405524+00	019dda81-85f0-7db5-bb97-8eb9853f4687	019e003d-ce37-78eb-b1d8-62d0047ef6c8	AB+	{"Muscle Gain"}	\N	\N
019df900-dacd-7d10-9094-4d25f14e0ec8	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-60333121	John	Smith	johnsmith@gmail.com	9898989898	2000-05-05 00:00:00+00	1	\N	\N	\N	2026-05-06 14:30:00+00	1	2026-05-07 07:07:56.136993+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 01:45:17.733755+00	019dda81-85f0-7db5-bb97-8eb9853f4687	019df900-dae5-7748-a07a-5bbdcd2cce2b	O+	{"Weight Loss","Muscle Gain"}	\N	\N
019e3092-3677-7a1b-940c-fe52965b6862	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-90935255	Alec	King	Alec@yahoo.com	788945562	1978-08-23 00:00:00+00	1	\N	Alec Sr	7889564510	2026-05-16 11:35:49.093427+00	1	2026-05-16 11:35:49.201271+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:35:49.201271+00	019dda81-85f0-7db5-bb97-8eb9853f4687	41606115-9e61-448f-950e-c0db701eefca	B+	{"Weight Loss","Muscle Gain"}	\N	\N
019e3096-db4b-78d2-a67a-877c83795249	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-34500977	Alice	jorden	alice@gmail.com	0878545457	2005-02-01 00:00:00+00	2	\N	\N	\N	2026-05-16 11:40:53.450097+00	1	2026-05-16 11:40:53.452244+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:40:53.452244+00	019dda81-85f0-7db5-bb97-8eb9853f4687	06c19fd0-eece-4aab-aadc-887619144420	\N	{}	\N	\N
019e3098-fc67-78d2-94da-b7b6998de969	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-29993189	Denis	evy	denevy@gmail.com	7548956424	2003-02-13 00:00:00+00	1	\N	Emy evy	568956457	2026-05-16 11:43:12.999318+00	1	2026-05-16 11:43:12.999834+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:43:12.999834+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	A+	{"General Fitness"}	\N	\N
019e309b-6e47-730c-9d40-bc9adc2d1b30	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-32238946	Kellee	Kimberly	KelleeKKimberly@gmail.com	2133451596	1998-07-09 00:00:00+00	2	\N	\N	\N	2026-05-16 11:45:53.223894+00	1	2026-05-16 11:45:53.225742+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:45:53.225742+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	B+	{"Flexibility & Mobility"}	\N	\N
019e309c-4da1-7a24-9f6e-98614fbcc9eb	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-04013388	Trevor	gary	garytrevor@gmail.com	9878459651	1999-04-12 00:00:00+00	1	\N	\N	\N	2026-05-16 11:46:50.401338+00	1	2026-05-16 11:46:50.402215+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:46:50.402215+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	AB-	{}	\N	\N
019e309d-3880-7e34-a2ac-995047490a6d	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-05287369	Scott	Fetter	ScottJFetter@gmail.com	96105589	2001-05-04 00:00:00+00	1	\N	\N	\N	2026-05-16 11:47:50.528736+00	1	2026-05-16 11:47:50.529311+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:47:50.529311+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	O+	{"Strength & Conditioning"}	\N	\N
\.


--
-- Data for Name: GymPlans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GymPlans" ("Id", "GymOwnerId", "Name", "Description", "Price", "DurationMonths", "MaxBranches", "Features", "IsActive", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "DiscountedPrice", "ExtendedMonths", "IsOffer") FROM stdin;
019ded98-c1a8-7ec4-b817-4a0d7be1f8cf	019dda81-85f0-7db5-bb97-8eb9853f4687	3 Months Plan	\N	5000.00	3	1	{Yoga,"Diet Plan",Cardio}	t	2026-05-04 20:28:24.48869+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 11:59:46.18264+00	\N	\N	\N	f
019dedc6-758b-7969-ba24-e35d71b7319d	019dda81-85f0-7db5-bb97-8eb9853f4687	1 Month Plan	one month gym plan	1500.00	1	1	{Yoga,Cardio}	t	2026-05-04 21:18:19.6598+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 23:15:36.634492+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	\N	f
019deda0-58f7-700d-88e1-20cc8fc655ba	019dda81-85f0-7db5-bb97-8eb9853f4687	6 Months Plan	\N	8000.00	6	2	{"Steam bath",Yoga,Cardio,"Diet Plan"}	t	2026-05-05 18:36:41.976279+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 23:15:40.381618+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	\N	f
019ded8b-cf03-70f6-af04-12d61f8e764f	019dda81-85f0-7db5-bb97-8eb9853f4687	12 Months Plan	Yearly membership access	12000.00	12	5	{"One month PT","Steam Bath","Locker Access","Diet Plans"}	t	2026-05-09 21:14:15.962715+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 09:52:42.740435+00	019dda81-85f0-7db5-bb97-8eb9853f4687	10000.00	0	f
\.


--
-- Data for Name: Gyms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Gyms" ("Id", "GymName", "BrandName", "Email", "Phone", "WebsiteUrl", "GstNumber", "RegistrationNumber", "EstablishedDate", "OwnerUserId", "AddressId", "LogoUrl", "BannerUrl", "Description", "IsActive", "IsVerified", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
472d8778-9a41-490d-aba9-3ccb02ab3ff3	The Gym World	Gym World Club	info@gymworld.com	9988776655			#gymworld001	2026-01-03 18:00:00+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f797397e-8dff-425c-88f3-bdcf272ec140				t	t	2026-05-02 12:35:27.065368+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-11 17:39:54.808956+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- Data for Name: InventoryItems; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventoryItems" ("Id", "Name", "SKU", "Category", "Description", "BuyingPrice", "SellingPrice", "StockQuantity", "ReorderLevel", "IsActive", "GymId", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "ImageUrl") FROM stdin;
019e110c-3ee5-7de4-aba6-db25fbd61a54	Whey Protein 1 Kg Muscle blaze 	SUP-5173	Supplements	Whey Protein 1 Kg Muscle Blaze Rich Cocoa	2449.00	2499.00	4	1	t	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-11 23:11:16.261387+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 14:06:17.588624+00	019dda81-85f0-7db5-bb97-8eb9853f4687	https://res.cloudinary.com/dy1fcodtg/image/upload/v1778408253/gymforge/products/04b42426-4bfb-42f5-8579-a1196b1e9d4c_wheyprotien.jpg
019e1417-3918-79f4-9b47-780d882bcb00	Creatine Micronized Monohydrate 500gm 	SUP-8166	Supplements	Creatine Micronized Monohydrate 500gm Muscle blaze - Watermalon flavour	799.00	799.00	2	1	t	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-11 20:52:06.836799+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 17:39:54.808937+00	019dda81-85f0-7db5-bb97-8eb9853f4687	https://res.cloudinary.com/dy1fcodtg/image/upload/v1778453527/gymforge/products/e37e7310-fae6-4077-91e4-126681ec7df3_creatine.jpg
\.


--
-- Data for Name: MaintenanceLogs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MaintenanceLogs" ("Id", "ServiceType", "Description", "TechnicianName", "ScheduledDate", "CompletedDate", "Status", "Notes", "EquipmentId", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "Cost", "EstimatedEndDate") FROM stdin;
019e11d4-fec2-7217-becc-41c70e3a6415	Routine	Routine checkup	Unknown	2026-05-10 00:00:00+00	2026-05-10 00:00:00+00	Completed	\N	019e1127-d0f0-779b-b165-9b249b5c9511	2026-05-10 12:20:32.266655+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 12:48:47.319157+00	019dda81-85f0-7db5-bb97-8eb9853f4687	500	2026-05-11 00:00:00+00
019e1a2f-a025-7330-b682-e5cf38da131e	Routine	Routine Checkup	Techfit solutions	2026-05-12 00:00:00+00	2026-05-12 00:00:00+00	Completed	\N	019e1a2d-98a0-7ce7-967f-b938ce3ddb26	2026-05-12 03:16:29.553053+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-12 03:16:46.950279+00	019dda81-85f0-7db5-bb97-8eb9853f4687	500	2026-05-13 00:00:00+00
\.


--
-- Data for Name: MemberMeasurements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MemberMeasurements" ("Id", "MemberId", "RecordedById", "Weight", "Height", "BodyFatPercentage", "BMI", "Notes", "Date", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
\.


--
-- Data for Name: MemberSubscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MemberSubscriptions" ("Id", "MemberId", "GymPlanId", "PlanNameSnapshot", "PricePaid", "DurationMonths", "ExtendedMonths", "StartDate", "EndDate", "IsActive", "PaymentStatus", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "IsComplementary") FROM stdin;
019df900-daf6-7598-a04c-ae8743bae32d	019df900-dacd-7d10-9094-4d25f14e0ec8	019ded8b-cf03-70f6-af04-12d61f8e764f	12 Months Plan	12000.00	12	0	2026-05-05 00:00:00+00	2027-05-05 00:00:00+00	t	2	2026-05-05 16:37:56.137016+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 01:35:14.911133+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
019dfe95-73b5-7bc8-8e06-931478515a62	019dfe95-73ad-70b5-a585-ee4e4653d314	019deda0-58f7-700d-88e1-20cc8fc655ba	6 Months Plan	8000.00	6	0	2026-05-06 18:38:20.596196+00	2026-11-06 18:38:20.596196+00	t	2	2026-05-06 18:38:20.610741+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 02:17:55.419735+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
019e003d-ce3e-7997-b013-ea9c11bd27e1	019e003d-ce36-77b0-9a77-a3c7d7c3caee	019dedc6-758b-7969-ba24-e35d71b7319d	1 Month Plan	1500.00	1	0	2026-05-07 02:21:51.037238+00	2026-06-07 02:21:51.037238+00	t	1	2026-05-07 02:21:51.051753+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 09:49:30.405557+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
019e3092-369c-7508-96b2-a1037f5246ec	019e3092-3677-7a1b-940c-fe52965b6862	019deda0-58f7-700d-88e1-20cc8fc655ba	6 Months Plan	8000.00	6	0	2026-05-16 11:35:49.144875+00	2026-11-16 11:35:49.144875+00	t	2	2026-05-16 11:35:49.201292+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:35:49.201292+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
019e3096-db4b-7b29-adfe-392adb2f234a	019e3096-db4b-78d2-a67a-877c83795249	019ded98-c1a8-7ec4-b817-4a0d7be1f8cf	3 Months Plan	5000.00	3	0	2026-05-16 11:40:53.451833+00	2026-08-16 11:40:53.451833+00	t	2	2026-05-16 11:40:53.452261+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:40:53.452261+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
019e3098-fc67-72e5-8925-d512a7beb5c5	019e3098-fc67-78d2-94da-b7b6998de969	019ded98-c1a8-7ec4-b817-4a0d7be1f8cf	3 Months Plan	5000.00	3	0	2026-05-16 11:43:12.99955+00	2026-08-16 11:43:12.99955+00	t	1	2026-05-16 11:43:12.999843+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:43:12.999843+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
019e309b-6e48-73c5-8855-a8c083c68c9b	019e309b-6e47-730c-9d40-bc9adc2d1b30	019ded8b-cf03-70f6-af04-12d61f8e764f	12 Months Plan	12000.00	12	0	2026-05-16 11:45:53.224085+00	2027-05-16 11:45:53.224085+00	t	3	2026-05-16 11:45:53.225763+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:45:53.225763+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
019e309c-4da1-7918-85fe-7ab337129ac5	019e309c-4da1-7a24-9f6e-98614fbcc9eb	019dedc6-758b-7969-ba24-e35d71b7319d	1 Month Plan	1500.00	1	0	2026-05-16 11:46:50.40184+00	2026-06-16 11:46:50.40184+00	t	2	2026-05-16 11:46:50.402229+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:46:50.402229+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
019e309d-3881-70c8-84c1-459e94908457	019e309d-3880-7e34-a2ac-995047490a6d	019deda0-58f7-700d-88e1-20cc8fc655ba	6 Months Plan	8000.00	6	0	2026-05-16 11:47:50.529113+00	2026-11-16 11:47:50.529113+00	t	2	2026-05-16 11:47:50.52932+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:47:50.52932+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
019e309e-c26a-7968-b016-312af5cb00a6	019e309e-c26a-795a-8156-3c9a3fa04701	019ded98-c1a8-7ec4-b817-4a0d7be1f8cf	3 Months Plan	5000.00	3	0	2026-05-16 11:49:31.37027+00	2026-08-16 11:49:31.37027+00	t	2	2026-05-16 11:49:31.370536+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:49:43.428322+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
019e309f-d28b-79bf-abd1-7918dbf7b3d8	019e309f-d28b-7c2e-880b-b88f9ef8079b	019ded98-c1a8-7ec4-b817-4a0d7be1f8cf	3 Months Plan	5000.00	3	0	2026-05-16 11:50:41.035625+00	2026-08-16 11:50:41.035625+00	t	2	2026-05-16 11:50:41.035875+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:50:41.035875+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
\.


--
-- Data for Name: PTAssignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PTAssignments" ("Id", "TrainerId", "MemberId", "StartDate", "EndDate", "SessionFrequency", "PreferredSlot", "IsActive", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
\.


--
-- Data for Name: Plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Plans" ("Id", "Name", "Description", "Price", "DurationInDays", "MaxBranches", "MaxMembers", "IsActive", "IsTrial", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
019dda83-b356-7f2c-898b-10ccf19c919d	Pro Tier - Monthly	Pro Tier monthly subscription plan	499.00	30	5	200	t	f	2026-04-29 18:32:37.67037+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:33:11.285579+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
019dda84-db2b-7f76-bc22-fcc66e3c64b4	Pro Tier - Yearly	Pro Tier - Yearly Subscription plan	5599.00	365	10	1000	t	f	2026-04-29 18:33:53.196362+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:33:53.196362+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
\.


--
-- Data for Name: RefreshTokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RefreshTokens" ("Id", "Token", "Expires", "Revoked", "GracePeriodExpires", "ReplacedByToken", "UserId", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
019dcf94-48b9-746f-a8ca-5cd5d96ad3da	Bk6w9q2M7lMwoRW07Mc9dLpH6h8iAMmUKxNhIWzjksjXA6fwDeMkU4IR1Zh289uqkIyCdIrLFwBwZQsZz53wrQ==	2026-05-04 15:34:54.865306+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-27 15:34:54.933417+00	00000000-0000-0000-0000-000000000000	2026-04-27 15:34:54.933417+00	\N
019dda56-211f-704b-8aff-9b52d8e5e9fc	xeZY+2HsYdmRrU2LcMGg/gsBRnm2s1MGlCXAudx8NjsNZCKcFeE7/Xy51t3/bfLNUic0XJjHzGkf2lkcT5xnAg==	2026-05-06 17:42:50.87184+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 17:42:50.938183+00	00000000-0000-0000-0000-000000000000	2026-04-29 17:42:50.938183+00	\N
019dda73-1fd4-7956-9bee-36929fa541e1	RFrACvJtqDeVk2nQgITdinjJHKrfQJbLSW+dAK6inY6tRANJSPFrETgOHWr4ZUiDOa5pL15qxnR6YZzxI6hZFg==	2026-05-06 18:14:31.123177+00	2026-04-29 18:35:25.770967+00	2026-04-29 18:36:25.771004+00	sBIyBRXRHkG4d44eEisPQV6O5aD1qBN3he/6eiC7KAp0lG6UdRg2EON1eXCTIEKiF6T1G+Sshq+inkw/erFpwg==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:14:31.124815+00	00000000-0000-0000-0000-000000000000	2026-04-29 18:35:25.959714+00	\N
019dda91-1b63-71a6-9f96-f8c24ee4e86f	7Iu/E82D2JfKmjXoku0PEFrXhqwJMTz2HZA5VmTi9z8SksS1W8lueEypMosZLClt303vpfbLfqtHfOLMd8Svaw==	2026-05-06 18:47:16.067113+00	2026-05-01 19:15:12.959997+00	2026-05-01 19:16:12.960047+00	x+xaA03FFn39xwxRCtBnYmngYS10fN+FhF8OeP1yBmYh9LTVNdt6cu5Bki+gkF0Bypegirc9xylNFgUGRVkFfA==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:47:16.067748+00	00000000-0000-0000-0000-000000000000	2026-05-01 19:15:13.760852+00	\N
019de4f7-6c7d-76ef-b502-239d6c3be612	x+xaA03FFn39xwxRCtBnYmngYS10fN+FhF8OeP1yBmYh9LTVNdt6cu5Bki+gkF0Bypegirc9xylNFgUGRVkFfA==	2026-05-08 19:15:12.961004+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-01 19:15:13.760815+00	00000000-0000-0000-0000-000000000000	2026-05-01 19:15:13.760815+00	\N
019dda97-726b-7552-ab1b-5ace52ffc1a7	DRg4DxVftjOPIH03twMKOTk6J5AayeopxSh+vnk/ndXQC5gwk/F/YRv5Ok2RUuoqupl2/fDoyrpipRSeXanRxA==	2026-05-06 18:54:11.563274+00	2026-05-01 19:21:16.936079+00	2026-05-01 19:22:16.936126+00	UJOXu+1HA07qosvK4aOdE3gjmmvemN0oVR1e+ud3gndDCYT/N9TBHo/z7baQnb33BacNlHysZgvMohfahSeGYQ==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:54:11.563579+00	00000000-0000-0000-0000-000000000000	2026-05-01 19:21:16.990218+00	\N
019de4fc-f7b6-7fd1-ad1e-301d34d196be	UJOXu+1HA07qosvK4aOdE3gjmmvemN0oVR1e+ud3gndDCYT/N9TBHo/z7baQnb33BacNlHysZgvMohfahSeGYQ==	2026-05-08 19:21:16.936826+00	2026-05-01 19:27:52.766059+00	2026-05-01 19:28:52.766059+00	bpsbk8gd6L2ZaM1FKEeOXwg4UdoQMa38D6q5QKchxbaKFg+WaNcNELQniw9GFazI6tmU56Oex362Rr1CHvOABQ==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-01 19:21:16.989674+00	00000000-0000-0000-0000-000000000000	2026-05-01 19:27:52.766596+00	\N
019de4f7-6c7d-7b40-b072-e878bd9e767d	sl/AhmLikqmdUVYkG6W7tmblWk3oXB3XRu+vQuz1ec+yqM9EO4KNJpXpCv2QN9N60Xwh4fS4Lr/1LRA2p7M4uQ==	2026-05-08 19:15:12.96101+00	2026-05-02 11:01:37.036769+00	2026-05-02 11:02:37.036795+00	LlXslt4IPF7kiIhw7iImyZzOQ7F9XSBt3RtiEhAPY2dwhNlmqh/h1SBpVWaSPOxsBMMVd7dMlZYDMgrRZL2P2g==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-01 19:15:13.760063+00	00000000-0000-0000-0000-000000000000	2026-05-02 11:01:37.539772+00	\N
019de503-01be-7ce2-9e79-20ddd2ca51ad	bpsbk8gd6L2ZaM1FKEeOXwg4UdoQMa38D6q5QKchxbaKFg+WaNcNELQniw9GFazI6tmU56Oex362Rr1CHvOABQ==	2026-05-08 19:27:52.766061+00	2026-05-02 11:08:58.640453+00	2026-05-02 11:09:58.640453+00	m1j6jVJopX2GZxpvyAOrdLTjanAE5SITeJbMvRDjuQ/uO4OQy2veoVXEQZRVI+brfw1KyOHlscWt/j2aLiR9qA==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-01 19:27:52.766577+00	00000000-0000-0000-0000-000000000000	2026-05-02 11:08:58.64204+00	\N
019de859-e078-75eb-b99d-6e28f31bd97c	LlXslt4IPF7kiIhw7iImyZzOQ7F9XSBt3RtiEhAPY2dwhNlmqh/h1SBpVWaSPOxsBMMVd7dMlZYDMgrRZL2P2g==	2026-05-09 11:01:37.037576+00	2026-05-02 11:27:29.418334+00	2026-05-02 11:28:29.418334+00	+q4zeSmqU8Nx2S6nr/OwJ9uQitwZrFiNGRZfn9WQMrlndbtLTjgWUpJMyqNl9y4G8spztMMbkS4VFGOOhfxRMA==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-02 11:01:37.539283+00	00000000-0000-0000-0000-000000000000	2026-05-02 11:27:29.418631+00	\N
019de860-9b91-79d2-bce6-faac14644e66	m1j6jVJopX2GZxpvyAOrdLTjanAE5SITeJbMvRDjuQ/uO4OQy2veoVXEQZRVI+brfw1KyOHlscWt/j2aLiR9qA==	2026-05-09 11:08:58.640455+00	2026-05-02 11:42:13.349575+00	2026-05-02 11:43:13.349628+00	3Ui7fI0Vpv7wnzE1fmHxhPKFQIGgjKjN69uGPh/auzj/JCRC6jRFn/2y69jBLtyTeEt+lgHuHWUvBHjUUsni9A==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-02 11:08:58.642019+00	00000000-0000-0000-0000-000000000000	2026-05-02 11:42:13.856436+00	\N
019de87f-0d01-7530-8ac3-6a6f347707ab	3Ui7fI0Vpv7wnzE1fmHxhPKFQIGgjKjN69uGPh/auzj/JCRC6jRFn/2y69jBLtyTeEt+lgHuHWUvBHjUUsni9A==	2026-05-09 11:42:13.350553+00	2026-05-02 11:53:51.175404+00	2026-05-02 11:54:51.175477+00	mKqWVuLiE7jbWgMJ8Ph+R1FOgtu2BLE8/5sPCAj5j1/luBRshKLq9q6Cms0Z8wgPXLJnz9ClKpz1tkSufzJ/lg==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-02 11:42:13.855946+00	00000000-0000-0000-0000-000000000000	2026-05-02 11:53:51.242316+00	\N
019de871-8e8a-7b66-947a-ba49c729374e	+q4zeSmqU8Nx2S6nr/OwJ9uQitwZrFiNGRZfn9WQMrlndbtLTjgWUpJMyqNl9y4G8spztMMbkS4VFGOOhfxRMA==	2026-05-09 11:27:29.418336+00	2026-05-02 11:54:41.938533+00	2026-05-02 11:55:41.938533+00	bUc04UnO0SsJmjon6M+vVaeev9tsvAMVYbQDy4Iv5W2b38fCclBbLzwuqKiTA63jsr5eKGr5qLq/nWl/irkBxg==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-02 11:27:29.418617+00	00000000-0000-0000-0000-000000000000	2026-05-02 11:54:41.939741+00	\N
019de895-0568-73d3-ac9e-94a9338b339d	/LvM7FFzRuuo2sXtuCkX/qGeNhlWjv53MfAA0riqBfR2RIksQFOWc6/QOx6qfy6eCc0qe9Nu2Cvan7NI0d2rhg==	2026-05-09 12:06:13.607599+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-02 12:06:13.608545+00	00000000-0000-0000-0000-000000000000	2026-05-02 12:06:13.608545+00	\N
019de895-45b8-7158-8ca4-540406b4b1f5	eyuy1mZYU2HO/Mvy9p9mLoZaXXDXu0CnchKO1XsOargR4lpGNmux7KSxEAPywWhpxON+6O0089QGBV47D7xAxA==	2026-05-09 12:06:30.071896+00	2026-05-02 12:31:27.490562+00	2026-05-02 12:32:27.490562+00	P+furE9OR38gAVSItVFRcC9lkMNxw98QIwKvOP52seSN71o2f1bg1eKjsK8DL141BIILdCwM8DEKGQkAZ3k5JQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-02 12:06:30.072311+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-02 12:31:27.491584+00	\N
019de8ac-1f03-7970-b60f-2baa492a3a68	P+furE9OR38gAVSItVFRcC9lkMNxw98QIwKvOP52seSN71o2f1bg1eKjsK8DL141BIILdCwM8DEKGQkAZ3k5JQ==	2026-05-09 12:31:27.490564+00	2026-05-02 12:55:14.588678+00	2026-05-02 12:56:14.588678+00	fsXpVOd1tt6geRehBl8becKe1/eHNyyVtDh59KGdBtAYxeYNJ0SDIVXByNlyJRXTzKr0HyL0TTWV0hM4asppKg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-02 12:31:27.49155+00	00000000-0000-0000-0000-000000000000	2026-05-02 12:55:14.588877+00	\N
019de8c1-e59c-7a36-8642-dff164962482	fsXpVOd1tt6geRehBl8becKe1/eHNyyVtDh59KGdBtAYxeYNJ0SDIVXByNlyJRXTzKr0HyL0TTWV0hM4asppKg==	2026-05-09 12:55:14.588681+00	2026-05-02 13:16:46.351098+00	2026-05-02 13:17:46.351098+00	3HbgKvVJJlZkPCQsFmzMcKRGu9M2hex8J1L4DVdINTSSVemoR9Baz9FCT6mA7gcvB8PggTNZwWkYXpx+fZEJKw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-02 12:55:14.588865+00	00000000-0000-0000-0000-000000000000	2026-05-02 13:16:46.351453+00	\N
019de8d5-9b8f-719d-836b-b45abe6bb3f0	3HbgKvVJJlZkPCQsFmzMcKRGu9M2hex8J1L4DVdINTSSVemoR9Baz9FCT6mA7gcvB8PggTNZwWkYXpx+fZEJKw==	2026-05-09 13:16:46.351101+00	2026-05-02 13:40:29.138371+00	2026-05-02 13:41:29.138371+00	zc5jyR+4Lg9FbDkTIb4Nv91WdIDE7kYgsaCzXaFCbIAR2ZzGtvj3WvcwdlB8BaO6JLi9eGt2aaYn2o5dMKGA/Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-02 13:16:46.351433+00	00000000-0000-0000-0000-000000000000	2026-05-02 13:40:29.138806+00	\N
019de8eb-5152-70f7-8bc5-bf41de65c4cb	zc5jyR+4Lg9FbDkTIb4Nv91WdIDE7kYgsaCzXaFCbIAR2ZzGtvj3WvcwdlB8BaO6JLi9eGt2aaYn2o5dMKGA/Q==	2026-05-09 13:40:29.138375+00	2026-05-02 17:46:47.571289+00	2026-05-02 17:47:47.571289+00	+exy2KbVxzExrC+9uQvX1GinF9y+qYUv1TURi/bryOPCerreNCA7KYK2Hx0TT6UgAefyfeTnbwx9wWtGOUG4iQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-02 13:40:29.138779+00	00000000-0000-0000-0000-000000000000	2026-05-02 17:46:47.571918+00	\N
019de9cc-d193-7ce8-a7da-92d95628fff4	+exy2KbVxzExrC+9uQvX1GinF9y+qYUv1TURi/bryOPCerreNCA7KYK2Hx0TT6UgAefyfeTnbwx9wWtGOUG4iQ==	2026-05-09 17:46:47.571292+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-02 17:46:47.571902+00	00000000-0000-0000-0000-000000000000	2026-05-02 17:46:47.571902+00	\N
019de89b-ba2b-7b14-a5cf-a63f9da1d42e	GXY6s6iFfZA23T2p3ju2eJWrdJqaCrRVvL3pR+VdKTWB88056IT03PxQhXheW8nfhP1gdeP7RDlzJ4RaBhL8Yw==	2026-05-09 12:13:33.099567+00	2026-05-02 17:49:42.588543+00	2026-05-02 17:50:42.588544+00	9VjFNP56Yv69AFAkBk0ToPky8gQgFv72/3cZMAzgeaZEnGjWnK/IwvV7dQa2M6PBUGhNmgJ+/4MeVvHm85esng==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-02 12:13:33.100048+00	00000000-0000-0000-0000-000000000000	2026-05-02 17:49:42.589011+00	\N
019de88a-7793-7982-868f-76ae5e81a4ff	bUc04UnO0SsJmjon6M+vVaeev9tsvAMVYbQDy4Iv5W2b38fCclBbLzwuqKiTA63jsr5eKGr5qLq/nWl/irkBxg==	2026-05-09 11:54:41.938536+00	2026-05-02 18:02:13.519686+00	2026-05-02 18:03:13.519733+00	hQoqypVWojU2Q6++i0TPMAbSoS7KCnSn9T/sG3wmLuHxRXKlLKf6dEvizuo72imShR17OoHusye2YYUL2lVRyg==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-02 11:54:41.939721+00	00000000-0000-0000-0000-000000000000	2026-05-02 18:02:14.025821+00	\N
019de9cd-b043-7718-b1db-1eaa6dfa5b69	XLbnTbwE0LGHKWhGA7xn4c8RcN+njgKWierzuT5wy9rJ5RLzu5ctCxardqbwJ6NhVnPInbo17x34/NCzA/sCqw==	2026-05-09 17:47:44.57967+00	2026-05-02 18:08:07.531807+00	2026-05-02 18:09:07.531808+00	4JHrySRL/myZ3ts2s0+FnB7qVe7131WDYE3oHHvPOolf1QpkI3ccP770mQsB6mZ8W+wt+M7Hr6tUNXIbV2urJA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-02 17:47:44.579946+00	00000000-0000-0000-0000-000000000000	2026-05-02 18:08:07.532463+00	\N
019de9e0-596c-7cec-8bcb-7c0d43f73c98	4JHrySRL/myZ3ts2s0+FnB7qVe7131WDYE3oHHvPOolf1QpkI3ccP770mQsB6mZ8W+wt+M7Hr6tUNXIbV2urJA==	2026-05-09 18:08:07.531812+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-02 18:08:07.532444+00	00000000-0000-0000-0000-000000000000	2026-05-02 18:08:07.532444+00	\N
019de9cf-7d3c-78f3-9832-3a69b1a764c4	9VjFNP56Yv69AFAkBk0ToPky8gQgFv72/3cZMAzgeaZEnGjWnK/IwvV7dQa2M6PBUGhNmgJ+/4MeVvHm85esng==	2026-05-09 17:49:42.588549+00	2026-05-02 18:10:47.006002+00	2026-05-02 18:11:47.006002+00	uKrwmbJQX1gWlls+YHg34v7moPVmd/3sF71fIzj4IwM1GLLTCGrsduN17Rk35G3WHjXSuV81pK8cXpgjYcfL9w==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-02 17:49:42.588993+00	00000000-0000-0000-0000-000000000000	2026-05-02 18:10:47.006483+00	\N
019de9e2-c85e-771e-a339-116ef10b7e2e	uKrwmbJQX1gWlls+YHg34v7moPVmd/3sF71fIzj4IwM1GLLTCGrsduN17Rk35G3WHjXSuV81pK8cXpgjYcfL9w==	2026-05-09 18:10:47.006006+00	2026-05-03 11:03:52.615887+00	2026-05-03 11:04:52.615888+00	JoZfRk3UDFdDkGjygWbsW3SywIZ8RrjFGju4HsuLsQbGsVyROMo3nEIqsOSia7GHyzrCcZJdD0TpMG93ZHlEgw==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-02 18:10:47.006464+00	00000000-0000-0000-0000-000000000000	2026-05-03 11:03:52.620258+00	\N
019de9da-f42a-7c68-8236-a109ded8882d	hQoqypVWojU2Q6++i0TPMAbSoS7KCnSn9T/sG3wmLuHxRXKlLKf6dEvizuo72imShR17OoHusye2YYUL2lVRyg==	2026-05-09 18:02:13.520711+00	2026-05-03 13:05:52.904216+00	2026-05-03 13:06:52.904217+00	iMV3vC/ytHDhepZKVT0dnccwYpPKsscnBNlCA9UYlPPWQBlYI2Tv335m24g7T+8N90Zy5kXK2Bs/PB+KCFog1Q==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-02 18:02:14.025328+00	00000000-0000-0000-0000-000000000000	2026-05-03 13:05:52.905028+00	\N
019ded5a-5541-7814-97d3-ec2ef9067c2d	CTa8qd2iADQIlctwcBCVGupsh0dhZaDNY2kKyjhesHZQ5A5YgdvRyc8zxXiqKR0zlV6PXfZUD3dhT6sIOyMCfA==	2026-05-10 10:20:13.467995+00	2026-05-03 11:01:04.926454+00	2026-05-03 11:02:04.926512+00	pmST8ks16JP9dqe7IhUeUCiexfYYaVPxVHjjG2It32VCRufNlngpVfkvkRlCPy2FFhFF7t05BgUP0ErFpoAGqA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 10:20:13.534191+00	00000000-0000-0000-0000-000000000000	2026-05-03 11:01:04.982485+00	\N
019ded7f-bd4c-7cce-8f4a-9c7183fce470	pmST8ks16JP9dqe7IhUeUCiexfYYaVPxVHjjG2It32VCRufNlngpVfkvkRlCPy2FFhFF7t05BgUP0ErFpoAGqA==	2026-05-10 11:01:04.927257+00	2026-05-03 11:22:32.145276+00	2026-05-03 11:23:32.145276+00	BYCzrw62/qUrVPfyo1HqM3zvLopgqLWOqYS1tP8K5231Zn/UFF9VRikvMA1Y6y6eepsibm5NP7ETiZL7p1svcg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 11:01:04.982135+00	00000000-0000-0000-0000-000000000000	2026-05-03 11:22:32.145667+00	\N
019ded82-4c2b-733c-a6ef-a657bc796aeb	JoZfRk3UDFdDkGjygWbsW3SywIZ8RrjFGju4HsuLsQbGsVyROMo3nEIqsOSia7GHyzrCcZJdD0TpMG93ZHlEgw==	2026-05-10 11:03:52.615892+00	2026-05-03 11:30:37.344572+00	2026-05-03 11:31:37.344572+00	HvI7CUp9Z6DUnErlUi/nijCCJv6KI5koNoFgGRjRCD7MhIH5IgBe6G0Jg23sPDRVi6lWYKYz0T7HChGnp4nukA==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-03 11:03:52.620195+00	00000000-0000-0000-0000-000000000000	2026-05-03 11:30:37.34484+00	\N
019ded93-6151-773a-9e3d-715ebe8cf2c4	BYCzrw62/qUrVPfyo1HqM3zvLopgqLWOqYS1tP8K5231Zn/UFF9VRikvMA1Y6y6eepsibm5NP7ETiZL7p1svcg==	2026-05-10 11:22:32.145279+00	2026-05-03 11:43:20.181407+00	2026-05-03 11:44:20.181407+00	7XmEeaXYOVlSmAYU04ULDivpBZlTXz65+oMlGnwnDOXUjUBDo9RN4UVhZ+w+PXoQenC6TVORaVsBTPW8Lbavaw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 11:22:32.145647+00	00000000-0000-0000-0000-000000000000	2026-05-03 11:43:20.181736+00	\N
019ded9a-c8a0-7f31-bdea-2e31322097e7	HvI7CUp9Z6DUnErlUi/nijCCJv6KI5koNoFgGRjRCD7MhIH5IgBe6G0Jg23sPDRVi6lWYKYz0T7HChGnp4nukA==	2026-05-10 11:30:37.344574+00	2026-05-03 12:01:05.155165+00	2026-05-03 12:02:05.155165+00	3Bn0LMctNyIGOCorprZvMj0N/zr97IC9r9dF0grTvqFG84eDzEK1VKsjPKMAbqUiPuwyW1WmQb5lH1lEDbKv+w==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-03 11:30:37.344825+00	00000000-0000-0000-0000-000000000000	2026-05-03 12:01:05.155473+00	\N
019deda6-6c75-7c58-b5a4-788d886aafe3	7XmEeaXYOVlSmAYU04ULDivpBZlTXz65+oMlGnwnDOXUjUBDo9RN4UVhZ+w+PXoQenC6TVORaVsBTPW8Lbavaw==	2026-05-10 11:43:20.181409+00	2026-05-03 12:09:11.33063+00	2026-05-03 12:10:11.33063+00	tVW+AGEj1mKWgMjoTA1eXppoZUL+9WSnXDVxqZ53u0wX5nNl/ub5Y8+5h9XDt4D0hXPHjlXqeEOkkOPALsQ2Gg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 11:43:20.181722+00	00000000-0000-0000-0000-000000000000	2026-05-03 12:09:11.330854+00	\N
019dedbf-0b57-78cf-8c55-5a1f047534c2	qKUpKauQ8rdsoywgPOZempCI/P/6YXBXogLUomNwyZU15fIPTK7A9zsLX+GKxnMr48ZAtBNaXlJpf/HM8KXCdA==	2026-05-10 12:10:13.719383+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 12:10:13.720061+00	00000000-0000-0000-0000-000000000000	2026-05-03 12:10:13.720061+00	\N
019deda5-5613-7dfa-94b5-25d654035e8f	XxjqnAxPzzjdUEp/aWLD0XzOGOXEAYccL36RaJRTuJvvbfib8gthyYgJKE0CT/SO3qA7S5IikV+ar7U+O1YTRg==	2026-05-10 11:42:08.9152+00	2026-05-03 12:10:15.469862+00	2026-05-03 12:11:15.469862+00	+l3Gclk3jnLkOvOivb42IQu8Zxx99uqaTVwFuHSIukD8sZuDj4eweMdpd/EijiZbx+n2U2e7Iq6crTKuvUL8Eg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 11:42:08.915424+00	00000000-0000-0000-0000-000000000000	2026-05-03 12:10:15.470893+00	\N
019dedb6-ac83-78e5-a292-564e2f182134	3Bn0LMctNyIGOCorprZvMj0N/zr97IC9r9dF0grTvqFG84eDzEK1VKsjPKMAbqUiPuwyW1WmQb5lH1lEDbKv+w==	2026-05-10 12:01:05.15517+00	2026-05-03 12:30:35.005189+00	2026-05-03 12:31:35.005259+00	VZPJQHTjTKtpgMa1nA27zCrcWvDw4knObuj/0/zvXQSFOrbBq2z6hCO0JDn/qCb0slfzGVnuugJuSRv7hH433Q==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-03 12:01:05.155451+00	00000000-0000-0000-0000-000000000000	2026-05-03 12:30:35.049284+00	\N
019dedbe-17a2-7e95-84be-a146d3f5e342	tVW+AGEj1mKWgMjoTA1eXppoZUL+9WSnXDVxqZ53u0wX5nNl/ub5Y8+5h9XDt4D0hXPHjlXqeEOkkOPALsQ2Gg==	2026-05-10 12:09:11.330637+00	2026-05-03 12:40:39.849334+00	2026-05-03 12:41:39.849335+00	Lq6Gq5IK5pWjb8rAUmV5MYFVvMtiTqtp9/cmkkVZTdIm4hYPL/4QEQixsQK2royx6JU+wEUOmxW97TWxwdsDcw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 12:09:11.330843+00	00000000-0000-0000-0000-000000000000	2026-05-03 12:40:39.85046+00	\N
019dedda-e8aa-7bfc-a8c2-48f666ea1a13	Lq6Gq5IK5pWjb8rAUmV5MYFVvMtiTqtp9/cmkkVZTdIm4hYPL/4QEQixsQK2royx6JU+wEUOmxW97TWxwdsDcw==	2026-05-10 12:40:39.849338+00	2026-05-03 13:04:14.808408+00	2026-05-03 13:05:14.808458+00	Zre5WZAZ49W0imq+gbn2NG2MrsuMG04mZVC/PVDaiFyrwhmVo27gDSrDtqwDc3rWKO+zfzhx6CSCjQJYzSTBbg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 12:40:39.850443+00	00000000-0000-0000-0000-000000000000	2026-05-03 13:04:16.107438+00	\N
019dedf0-8486-729a-b28e-66d0d213adf8	4OB7geYutjEC25q5L3jmWOe0/p1gowcT2AYJ2tfNw3Cb++TxqYYT4u/RwoJBwP3DfDUOU77OAa5xlxBUu5dxNw==	2026-05-10 13:04:14.809693+00	2026-05-03 14:11:19.649851+00	2026-05-03 14:12:19.649884+00	EUKhrItL95rF/EUHCcxPGLQMuidTO+rECvBKjTUtVy0F8N1xXDZ+YQ0AIw55GmBspnIS22DtMwa1MGgsnZX+Ww==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-03 13:04:16.106801+00	00000000-0000-0000-0000-000000000000	2026-05-03 14:11:20.25483+00	\N
019dedd1-ae21-7e44-96c2-c58a157a12d8	VZPJQHTjTKtpgMa1nA27zCrcWvDw4knObuj/0/zvXQSFOrbBq2z6hCO0JDn/qCb0slfzGVnuugJuSRv7hH433Q==	2026-05-10 12:30:35.006221+00	2026-05-03 13:04:14.808367+00	2026-05-03 13:05:14.808431+00	4OB7geYutjEC25q5L3jmWOe0/p1gowcT2AYJ2tfNw3Cb++TxqYYT4u/RwoJBwP3DfDUOU77OAa5xlxBUu5dxNw==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-03 12:30:35.049168+00	00000000-0000-0000-0000-000000000000	2026-05-03 13:04:16.107428+00	\N
019dedbf-122e-7125-bcac-b4794a69524d	+l3Gclk3jnLkOvOivb42IQu8Zxx99uqaTVwFuHSIukD8sZuDj4eweMdpd/EijiZbx+n2U2e7Iq6crTKuvUL8Eg==	2026-05-10 12:10:15.469866+00	2026-05-03 13:04:14.808443+00	2026-05-03 13:05:14.808443+00	8hYTTG9mx0uPOQ5wcGOU7V7uoyuSFO032vSDCcMhHu7HPtThcFzsosbRNt4FjD3g1FO90p2gsrY0kNlamljIeg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 12:10:15.470881+00	00000000-0000-0000-0000-000000000000	2026-05-03 13:04:16.107426+00	\N
019dedf0-8486-7719-9101-e0e9b1988009	8hYTTG9mx0uPOQ5wcGOU7V7uoyuSFO032vSDCcMhHu7HPtThcFzsosbRNt4FjD3g1FO90p2gsrY0kNlamljIeg==	2026-05-10 13:04:14.80971+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 13:04:16.106808+00	00000000-0000-0000-0000-000000000000	2026-05-03 13:04:16.106808+00	\N
019dee2d-ebdd-7022-b419-ebad4f6717aa	EUKhrItL95rF/EUHCcxPGLQMuidTO+rECvBKjTUtVy0F8N1xXDZ+YQ0AIw55GmBspnIS22DtMwa1MGgsnZX+Ww==	2026-05-10 14:11:19.650769+00	2026-05-03 15:31:36.896457+00	2026-05-03 15:32:36.896495+00	J3KXaXvrJWKFML1mRf9Oq14knGU8KZXQYaXcmJ+hGd22iQxLnb2S0w59UYwgEqSuTAver93oFosWIQtE4JEp+Q==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-03 14:11:20.254359+00	00000000-0000-0000-0000-000000000000	2026-05-03 15:31:37.50982+00	\N
019dedf0-8485-7200-93f7-1a75c6e8126d	Zre5WZAZ49W0imq+gbn2NG2MrsuMG04mZVC/PVDaiFyrwhmVo27gDSrDtqwDc3rWKO+zfzhx6CSCjQJYzSTBbg==	2026-05-10 13:04:14.8097+00	2026-05-03 15:37:46.696131+00	2026-05-03 15:38:46.696132+00	fKpDhAC8rS98mfrTohxHr/bTgGzKNApMNBUzCHj1YZMx6tnmh541Qhl8aF0XgJnkYWLntlFkYOQ6kq6EWw1hrQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 13:04:16.106809+00	00000000-0000-0000-0000-000000000000	2026-05-03 15:37:46.697815+00	\N
019dee77-6d9c-7f57-a733-49878f87edd2	J3KXaXvrJWKFML1mRf9Oq14knGU8KZXQYaXcmJ+hGd22iQxLnb2S0w59UYwgEqSuTAver93oFosWIQtE4JEp+Q==	2026-05-10 15:31:36.897573+00	2026-05-03 15:43:24.219616+00	2026-05-03 15:44:24.21979+00	lc82zrCgb0Qt3/cf1vIa3EW0fCNCZCJZFqxRhK6MV4GIh24YxNtzQIacmVBA5ImeEus7wlHstBltRbG30Ttdlw==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-03 15:31:37.509348+00	00000000-0000-0000-0000-000000000000	2026-05-03 15:43:24.289939+00	\N
019dee82-d40a-750c-b402-dcd010ef184a	klO7VsWdQnK5FbIa5Wew1lIpZFPY5MiM9l9HDF6kNeRtDQiax7yw4/cISVppg6HgxVjNqH2q1lNwhdHVSm3Ymw==	2026-05-10 15:44:04.617312+00	2026-05-03 16:04:28.607517+00	2026-05-03 16:05:28.607518+00	U7jCxbFBEze3PuOkwhY0iaVrzF5OAHeXtArsjOAkdDaqzlD0uYdaNQZjw2Iu4u9Y3eaaDQpPqc12Dlu7bP0KwA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 15:44:04.618915+00	00000000-0000-0000-0000-000000000000	2026-05-03 16:04:28.629571+00	\N
019dee7d-0fc9-71ba-bb5d-b2366ccbed60	fKpDhAC8rS98mfrTohxHr/bTgGzKNApMNBUzCHj1YZMx6tnmh541Qhl8aF0XgJnkYWLntlFkYOQ6kq6EWw1hrQ==	2026-05-10 15:37:46.696136+00	2026-05-03 15:44:04.837766+00	2026-05-03 15:45:04.837766+00	BHktniM/xprDqj3D8Wohm1zvVw/fAd2foQNLnEwTN0Ff45US3y8dDKAXZ0IZGljloQ11pr51zZjwqmHhN+VOHQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 15:37:46.69779+00	00000000-0000-0000-0000-000000000000	2026-05-03 15:44:04.838035+00	\N
019dee82-d4e5-7a55-9350-4b77fb4a96e0	BHktniM/xprDqj3D8Wohm1zvVw/fAd2foQNLnEwTN0Ff45US3y8dDKAXZ0IZGljloQ11pr51zZjwqmHhN+VOHQ==	2026-05-10 15:44:04.83777+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 15:44:04.838013+00	00000000-0000-0000-0000-000000000000	2026-05-03 15:44:04.838013+00	\N
019dee95-8142-7bb9-a116-4cff28983b78	U7jCxbFBEze3PuOkwhY0iaVrzF5OAHeXtArsjOAkdDaqzlD0uYdaNQZjw2Iu4u9Y3eaaDQpPqc12Dlu7bP0KwA==	2026-05-10 16:04:28.60753+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 16:04:28.628811+00	00000000-0000-0000-0000-000000000000	2026-05-03 16:04:28.628811+00	\N
019dee82-3678-7521-a98b-af8ae65ea936	lc82zrCgb0Qt3/cf1vIa3EW0fCNCZCJZFqxRhK6MV4GIh24YxNtzQIacmVBA5ImeEus7wlHstBltRbG30Ttdlw==	2026-05-10 15:43:24.221177+00	2026-05-03 16:04:28.478621+00	2026-05-03 16:05:28.478835+00	cGe8nDacV+uMZhVgdzUO0R88J1ZNkCL0bUJgb38gg33iBoIL228nK68PXV5tWHH1dN9wWyZbp4U4VLJfrj4CKw==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-03 15:43:24.289361+00	00000000-0000-0000-0000-000000000000	2026-05-03 16:04:28.62957+00	\N
019dedf0-8486-7474-99a6-2d87d38bffb5	U5TWHhfKxKYsDQmGTjqr8Y9ZzaJGsNA1DmZ2q3Y9b+PWpiLw/HkKPXFFSOOthMTbp5puShHoHr5VKuxNTjxsFw==	2026-05-10 13:04:14.809706+00	2026-05-03 18:12:40.243327+00	2026-05-03 18:13:40.243327+00	mqMROsNVJ8efMTnPFOHNt2NGPdlHUDbjlks5p5/AKLCKN2ernl3e+ZYA3SCWeU6uLqxlvBAMCR1hRDQKRjyWcQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 13:04:16.1068+00	00000000-0000-0000-0000-000000000000	2026-05-03 18:12:40.244591+00	\N
019dee95-813e-71a9-ac47-22b14feda0cb	cGe8nDacV+uMZhVgdzUO0R88J1ZNkCL0bUJgb38gg33iBoIL228nK68PXV5tWHH1dN9wWyZbp4U4VLJfrj4CKw==	2026-05-10 16:04:28.480799+00	2026-05-03 18:30:31.516809+00	2026-05-03 18:31:31.51681+00	IyF3AS3TtpJLueJ32xnE8SXZNS66wyfP6twZ0YYNsgXHrwNkfsj3iWTKXAPDeIaeB5JSX0qJUoyJTX2krEMdyA==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-03 16:04:28.628812+00	00000000-0000-0000-0000-000000000000	2026-05-03 18:30:31.518684+00	\N
019def0a-deb4-726f-a997-2805c4a6d4ce	mqMROsNVJ8efMTnPFOHNt2NGPdlHUDbjlks5p5/AKLCKN2ernl3e+ZYA3SCWeU6uLqxlvBAMCR1hRDQKRjyWcQ==	2026-05-10 18:12:40.243334+00	2026-05-08 20:28:19.182238+00	2026-05-08 20:29:19.182238+00	omd9iLVDTw8K39S+LczJc58ciWps1KYjBZxyZMxPFAD7byY+Z97kM9uKKTgVnK+k/06HL0J4d4jyeEbkZm7j0Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 18:12:40.244557+00	00000000-0000-0000-0000-000000000000	2026-05-08 20:28:19.182785+00	\N
019def1b-375e-750f-af9a-650d12fb12af	IyF3AS3TtpJLueJ32xnE8SXZNS66wyfP6twZ0YYNsgXHrwNkfsj3iWTKXAPDeIaeB5JSX0qJUoyJTX2krEMdyA==	2026-05-10 18:30:31.516834+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-03 18:30:31.51866+00	00000000-0000-0000-0000-000000000000	2026-05-03 18:30:31.51866+00	\N
019dedf5-804d-79d9-ba02-487f3ea377ed	Nhvz/BDWsmaX7wMj4qdi3wWXEbpSEpiV26sC9m/CKznT5zcoDHYUQNfK89GuQERufu3pCanJviSVlz8F+i67qA==	2026-05-10 13:09:42.604866+00	2026-05-03 18:31:22.724596+00	2026-05-03 18:32:22.724627+00	FLYt3a2uSQoWa5oS5Yr22Tawx17ZDRbaTfIxUReFRQvsw0WN9qtlHVZQ1ogFdr61tNBDKBF7Fny4tcckqnPp+g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 13:09:42.605358+00	00000000-0000-0000-0000-000000000000	2026-05-03 18:31:23.823613+00	\N
019def1c-034b-73a0-8904-509d88d11f27	FLYt3a2uSQoWa5oS5Yr22Tawx17ZDRbaTfIxUReFRQvsw0WN9qtlHVZQ1ogFdr61tNBDKBF7Fny4tcckqnPp+g==	2026-05-10 18:31:22.725528+00	2026-05-04 16:33:20.738288+00	2026-05-04 16:34:20.738334+00	xQqkzHb8gnDa2zzR6rVuMHkzglUVGmTYBVKJDeet4PUTvssOGj9zuQtUWH4r4m/fNIwaxH/+lVoVoX7tk+8hKQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-03 18:31:23.822997+00	00000000-0000-0000-0000-000000000000	2026-05-04 16:33:22.042786+00	\N
019df3d9-5133-7910-835a-adb5779d3e9b	OF4G9VtoYw6Tf0BGo7JhNmWFBoMXSl2OVpuGHwKN0XkpSY6BG9tfyPUaMrpwhyZv3ELPRrXu5tTIa/BhYTALWg==	2026-05-11 16:36:38.796414+00	2026-05-04 17:13:12.223735+00	2026-05-04 17:14:12.223779+00	iy/cC+bFdHrW77nY2iHoWHWP7LSvqWG0QqMPLpXi0V4ZInyVSZ3tn3AuJEAa3c/NgFUJZZMvjgwVUAiNd+2AWQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-04 16:36:38.865325+00	00000000-0000-0000-0000-000000000000	2026-05-04 17:13:12.283698+00	\N
019df3fa-c953-7a1a-a71c-950839b522ef	iy/cC+bFdHrW77nY2iHoWHWP7LSvqWG0QqMPLpXi0V4ZInyVSZ3tn3AuJEAa3c/NgFUJZZMvjgwVUAiNd+2AWQ==	2026-05-11 17:13:12.224581+00	2026-05-04 17:38:07.727496+00	2026-05-04 17:39:07.727496+00	zE3uPgarzYR2WYJTWF+vzD92cx8W3TWX4unArJqvj0+OoT3W2KW4+onqjnAh6dccptE+OC7jCoCAg4Hf1hyp9Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-04 17:13:12.283155+00	00000000-0000-0000-0000-000000000000	2026-05-04 17:38:07.728484+00	\N
019df411-9af0-7dc1-90de-54ed8da49599	zE3uPgarzYR2WYJTWF+vzD92cx8W3TWX4unArJqvj0+OoT3W2KW4+onqjnAh6dccptE+OC7jCoCAg4Hf1hyp9Q==	2026-05-11 17:38:07.727507+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-04 17:38:07.728467+00	00000000-0000-0000-0000-000000000000	2026-05-04 17:38:07.728467+00	\N
019df8dd-607c-73fb-a87a-99beaedb79d9	M5ifRKY+XyLmLxa4ZEcweXwYqflw8xdz5mpc8BZdrozZan8nRnV6TYVU3vOe5PYA3GmopVKx9KeLxvNTJddG4g==	2026-05-12 15:59:10.933038+00	2026-05-05 16:28:54.660993+00	2026-05-05 16:29:54.661044+00	CydqAjb9QmFrFfLwU5tK18dYxdcE4QBHbE/4T7fZ6KW+7S0dRU64IrQQcfnLFZrPtOi4AYHRX5UdIbQfgIJqGw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-05 15:59:11.001561+00	00000000-0000-0000-0000-000000000000	2026-05-05 16:28:54.66286+00	\N
019df8f8-9806-7c4c-8b20-7492d091d7a8	CydqAjb9QmFrFfLwU5tK18dYxdcE4QBHbE/4T7fZ6KW+7S0dRU64IrQQcfnLFZrPtOi4AYHRX5UdIbQfgIJqGw==	2026-05-12 16:28:54.661153+00	2026-05-05 16:51:57.592988+00	2026-05-05 16:52:57.593079+00	MuE8cgKxwaP2ldAclHZl4p/5cCl6lCDbDwN+N9tGgFnkMQdtsdSIgE751O5AZ6rZr7fdT/12MfuZxfaKP/xfPA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-05 16:28:54.662845+00	00000000-0000-0000-0000-000000000000	2026-05-05 16:51:57.670603+00	\N
019df90d-b25a-7dd2-b124-72ed33fba932	MuE8cgKxwaP2ldAclHZl4p/5cCl6lCDbDwN+N9tGgFnkMQdtsdSIgE751O5AZ6rZr7fdT/12MfuZxfaKP/xfPA==	2026-05-12 16:51:57.594272+00	2026-05-05 17:16:02.432705+00	2026-05-05 17:17:02.432705+00	847ka7pE0SYNqEtR3ndCNs1HEwXuOu0sxZSblMwD7C0c3pxsg/Np2fY8cHGrxBtzRmhB+ybJFsyfMUpJIRLvzQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-05 16:51:57.670245+00	00000000-0000-0000-0000-000000000000	2026-05-05 17:16:02.434361+00	\N
019df923-be02-7505-bd2d-c9dc6c1bc5b0	847ka7pE0SYNqEtR3ndCNs1HEwXuOu0sxZSblMwD7C0c3pxsg/Np2fY8cHGrxBtzRmhB+ybJFsyfMUpJIRLvzQ==	2026-05-12 17:16:02.432708+00	2026-05-05 17:39:19.328962+00	2026-05-05 17:40:19.328962+00	PmMr3Bf8SoR3glwW+bsSmjQRYcAFfzc6xBpyCTYKtadY9Cr9J/VCclH+2NtyXDceZHBzv5pGF7cfBm96uNTcMg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-05 17:16:02.434325+00	00000000-0000-0000-0000-000000000000	2026-05-05 17:39:19.329321+00	\N
019df939-0ea1-7188-8045-e3b4da7f8e63	PmMr3Bf8SoR3glwW+bsSmjQRYcAFfzc6xBpyCTYKtadY9Cr9J/VCclH+2NtyXDceZHBzv5pGF7cfBm96uNTcMg==	2026-05-12 17:39:19.328965+00	2026-05-05 18:03:38.616668+00	2026-05-05 18:04:38.616718+00	0/0e7JqN4j3cTWO5jBkIHB2RFM4VncqUooOuakDLBf0GPLMvY/Nn9M9w/MJxIBjTTaxQ6X0ZnxeYabOlxfxHiQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-05 17:39:19.329305+00	00000000-0000-0000-0000-000000000000	2026-05-05 18:03:38.670002+00	\N
019df94f-5325-7591-802d-dd6151ff75ac	0/0e7JqN4j3cTWO5jBkIHB2RFM4VncqUooOuakDLBf0GPLMvY/Nn9M9w/MJxIBjTTaxQ6X0ZnxeYabOlxfxHiQ==	2026-05-12 18:03:38.617462+00	2026-05-06 01:11:16.508367+00	2026-05-06 01:12:16.508426+00	763NPWWNSheRZ0Jw0sOTAJa57b0pCJg0ImWod+i8x1JiDl2Z8b8AqSUrUtSjOFoH+lEqlYmoncdFlndGz2nO5Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-05 18:03:38.669638+00	00000000-0000-0000-0000-000000000000	2026-05-06 01:11:16.566584+00	\N
019dfad7-f6ff-76a1-8d79-cfcfeaf1796c	Pz71vvo6rTUVvlEOUYMetB+xFgrnILQjYZYTtqFUKyRWEq3FhuWw9lrAezhh+N2onju/z/XZXDj7YYU6TWWhIg==	2026-05-13 01:12:30.718765+00	2026-05-06 01:34:57.790352+00	2026-05-06 01:35:57.790421+00	hhgWFkOzIMNOfa6e2ECsMR6p7e2qdRw2If6e7GcPeb9jME/dXvJNwQqLlyBsh0Q03tfgONxqxkRVB77IWRMwNQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-06 01:12:30.719569+00	00000000-0000-0000-0000-000000000000	2026-05-06 01:34:57.85054+00	\N
019dfaec-852f-7451-af8d-b2dd3d6c66fb	hhgWFkOzIMNOfa6e2ECsMR6p7e2qdRw2If6e7GcPeb9jME/dXvJNwQqLlyBsh0Q03tfgONxqxkRVB77IWRMwNQ==	2026-05-13 01:34:57.791393+00	2026-05-06 01:55:27.192595+00	2026-05-06 01:56:27.192673+00	1oA4E80Uim43wnjnLo5A/n8UVTWOtDto7APPf7EV5eouYUzo8BIe0I9u6iwMtte144E/7pS0d+i3nsqmyS3Few==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-06 01:34:57.850138+00	00000000-0000-0000-0000-000000000000	2026-05-06 01:55:27.272429+00	\N
019dfaff-479a-77a9-b6ed-34600ec7df55	1oA4E80Uim43wnjnLo5A/n8UVTWOtDto7APPf7EV5eouYUzo8BIe0I9u6iwMtte144E/7pS0d+i3nsqmyS3Few==	2026-05-13 01:55:27.19386+00	2026-05-06 02:25:58.409237+00	2026-05-06 02:26:58.409237+00	hD1VVWt2gbkEWO8nYB+gET2gpkIunI5Q1/ADFHJ94HPi32nxkBtDN3t7muUWyTRv+m4esN0DeqFj2dZvzxn4FA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-06 01:55:27.271884+00	00000000-0000-0000-0000-000000000000	2026-05-06 02:25:58.409644+00	\N
019dfb23-3696-7f77-b7a3-ca7734f9c4a1	S6jYvPzSTItUOB1n5XLh+4JwWQ/mwm9zohJfU274XpqBtVDO5UZ2oc0bDxpHVZNXH1xYVtDMtPceXJeLviV18g==	2026-05-13 02:34:41.200233+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-06 02:34:42.295965+00	00000000-0000-0000-0000-000000000000	2026-05-06 02:34:42.295965+00	\N
019dfe8f-7922-7795-be57-2ff1978859ab	YOseq3DwQl4+M3FvolkRWwj34gNaYtozw2kMwZJnYQFjEYwu/jdf7NO5yk73B1il55iS45STLg+NueFX0LEfqw==	2026-05-13 18:31:48.733289+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-06 18:31:48.795842+00	00000000-0000-0000-0000-000000000000	2026-05-06 18:31:48.795842+00	\N
019dfb23-3696-7b50-80fc-39af663a0d99	2wHMi5NmR2JRF091A1jlMuj25kZqJ3HdeMooUmr1z+wFpmSbqe0tcpfRZ4R3IyPNNPNcEeIlZ9AfVOVuzf4Epw==	2026-05-13 02:34:41.200242+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-06 02:34:42.295971+00	00000000-0000-0000-0000-000000000000	2026-05-06 02:34:42.295971+00	\N
019df3d6-5018-79cc-be9a-820ad4352250	xQqkzHb8gnDa2zzR6rVuMHkzglUVGmTYBVKJDeet4PUTvssOGj9zuQtUWH4r4m/fNIwaxH/+lVoVoX7tk+8hKQ==	2026-05-11 16:33:20.739636+00	2026-05-06 02:40:48.620014+00	2026-05-06 02:41:48.620014+00	JHEXQiRY5JTzcDeV9PrNhM1tjCxBmMnE2iXosHDzCoDU1BYNqluPoEmMlYB+pq5+yXB5vLEKrVftCgo7ZfL0Dw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-04 16:33:22.042136+00	00000000-0000-0000-0000-000000000000	2026-05-06 02:40:48.620586+00	\N
019dfb2a-a61d-7f7c-bec4-07d646d5c2dc	ML23LD4kRByXUB8hjtZPw6CiWClV3rWv2yzbY3XG+8HvOq6EQp1M6jm2rUSKqDX3NwoZTmR3pAqhCZTg18RuvQ==	2026-05-13 02:42:49.500987+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-06 02:42:49.501695+00	00000000-0000-0000-0000-000000000000	2026-05-06 02:42:49.501695+00	\N
019dfb28-cdec-7a89-99b7-279006e800e0	JHEXQiRY5JTzcDeV9PrNhM1tjCxBmMnE2iXosHDzCoDU1BYNqluPoEmMlYB+pq5+yXB5vLEKrVftCgo7ZfL0Dw==	2026-05-13 02:40:48.620016+00	2026-05-06 03:02:39.498958+00	2026-05-06 03:03:39.498985+00	knqOAhTPM3NDkg4CP9524H4rnTgVi+uCY3ZLYlMbDhPKGhxd0f/qlJxiujkgs571PuJOVzF7Q84lkXjI9+Gtxw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-06 02:40:48.620564+00	00000000-0000-0000-0000-000000000000	2026-05-06 03:02:39.992426+00	\N
019dfbf3-0078-71e6-9bbe-eb424fcd42d0	zRm8F4tD0hGEyaFgPgnhidULaF11a/nzYQlCGX/TgX1n+5tRGM1MhacJ6WohSFn224NYqLGeeW6Ic9ZtOZcL3A==	2026-05-13 06:21:39.434926+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-06 06:21:40.039662+00	00000000-0000-0000-0000-000000000000	2026-05-06 06:21:40.039662+00	\N
019dfb2b-15a2-787d-aed6-3cc883fda2e6	ltKg//ASu984zJ3EBWa5xjyKBWtH5Qa0607y9/HdPJ5M1HlkKcj933asy9YHTJr3b7+GD/zc9iOcgYkwNl9iyg==	2026-05-13 02:43:18.009108+00	2026-05-06 18:32:31.77376+00	2026-05-06 18:33:31.773858+00	Rc0P/K8xHX9yiat6dgYPxXOip4KSJdaDqxtKTaCd9Su4T3/A/I2kxtehevmd0qcuGPEMcLWa3X+WFRvG7k64DQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-06 02:43:18.078419+00	00000000-0000-0000-0000-000000000000	2026-05-06 18:32:31.776482+00	\N
019dfe90-2120-70d2-ac5d-909a2a8b487d	Rc0P/K8xHX9yiat6dgYPxXOip4KSJdaDqxtKTaCd9Su4T3/A/I2kxtehevmd0qcuGPEMcLWa3X+WFRvG7k64DQ==	2026-05-13 18:32:31.774044+00	2026-05-07 00:47:35.33021+00	2026-05-07 00:48:35.330272+00	L8Ie0BmbMjduio5iQOqmRG+tnjaHJQ0MI0k1P2kak1qncUeGL7VdZoTaVb9bG2F52jqjl5OxG2n4q823Vr92zg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-06 18:32:31.776457+00	00000000-0000-0000-0000-000000000000	2026-05-07 00:47:35.408202+00	\N
019dffe7-81e1-7233-aa97-85b68fbaf02c	L8Ie0BmbMjduio5iQOqmRG+tnjaHJQ0MI0k1P2kak1qncUeGL7VdZoTaVb9bG2F52jqjl5OxG2n4q823Vr92zg==	2026-05-14 00:47:35.331371+00	2026-05-07 01:10:07.216276+00	2026-05-07 01:11:07.216276+00	aw5BPAGSPjTYziRFmgP2a7GNfbj+dZ7+N35SCyMY0ZePk0bABa1noS/nSIiyMUnFJ2RcyUkh8b/sGMwhfZU39w==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 00:47:35.406604+00	00000000-0000-0000-0000-000000000000	2026-05-07 01:10:07.218298+00	\N
019dfffc-2271-74ea-84c0-7d42f1c54e4e	aw5BPAGSPjTYziRFmgP2a7GNfbj+dZ7+N35SCyMY0ZePk0bABa1noS/nSIiyMUnFJ2RcyUkh8b/sGMwhfZU39w==	2026-05-14 01:10:07.216281+00	2026-05-07 01:30:40.186328+00	2026-05-07 01:31:40.186328+00	ok7YKsqSUBjZLUZU+f2PkZSW3FSH+7oTf+n97EarVe4gkjVgnSjz0oZEWfcYCOuJAb7c7YkIUTSD9K+JCmTung==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 01:10:07.218271+00	00000000-0000-0000-0000-000000000000	2026-05-07 01:30:40.186668+00	\N
019e0019-3f8c-795a-98bb-565f7605439c	SvZtooZmswn6T5xxBU771bucc8MxeQqlyVBd9/kJaHDjniDUI6CosFFQRe+GoCvdKxijdKHlSI5QIwkoGoVBdw==	2026-05-14 01:41:55.190835+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 01:41:55.227132+00	00000000-0000-0000-0000-000000000000	2026-05-07 01:41:55.227132+00	\N
019e000e-f2ba-7c8e-be5e-4c98ea97ff10	ok7YKsqSUBjZLUZU+f2PkZSW3FSH+7oTf+n97EarVe4gkjVgnSjz0oZEWfcYCOuJAb7c7YkIUTSD9K+JCmTung==	2026-05-14 01:30:40.18633+00	2026-05-07 02:11:50.542672+00	2026-05-07 02:12:50.542703+00	tbu0wP11MiRY2g16Zf3yY2WCp7jJFeu/O8QtE0ENMYtwgX9e0SXbpwUQCZncroAnXZ/6Fr1xAl9ZgIaCpsx3IQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 01:30:40.186656+00	00000000-0000-0000-0000-000000000000	2026-05-07 02:11:51.144435+00	\N
019e0034-a6d9-778d-9a32-844fb7d53dd3	tbu0wP11MiRY2g16Zf3yY2WCp7jJFeu/O8QtE0ENMYtwgX9e0SXbpwUQCZncroAnXZ/6Fr1xAl9ZgIaCpsx3IQ==	2026-05-14 02:11:50.543659+00	2026-05-07 02:12:28.027202+00	2026-05-07 02:13:28.027266+00	uYQ8OxKpQKokGNlM8bov8ATq49ZbPw812655gRUii8mENfjC7D5fk9RWkel9dqSTdukyvO4SK5deMFR1uNmXzg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 02:11:51.143641+00	00000000-0000-0000-0000-000000000000	2026-05-07 02:12:28.087414+00	\N
019e0035-372c-7ad1-b2b0-aab8afc7169e	uYQ8OxKpQKokGNlM8bov8ATq49ZbPw812655gRUii8mENfjC7D5fk9RWkel9dqSTdukyvO4SK5deMFR1uNmXzg==	2026-05-14 02:12:28.028014+00	2026-05-07 02:26:39.940442+00	2026-05-07 02:27:39.940442+00	1h6NodXtiMza9ZzQejqsmg34UpFb7dzfIiRMAy5bZecg4MZbuQJTioP9ZBDpAEVYVcqp3vtQvcv5Q0N+oQ4ePA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 02:12:28.086881+00	00000000-0000-0000-0000-000000000000	2026-05-07 02:26:39.941987+00	\N
019e0050-7c8f-782a-9af3-3b425a245a05	qCu5/UKwM/D7RLcntPobiROrHz39cjFmDVlCHh1qSHvuHa+4plBXzVM2pNVbmNCBABSeKsipjab6hlCaBInILQ==	2026-05-14 02:42:14.312211+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 02:42:15.416634+00	00000000-0000-0000-0000-000000000000	2026-05-07 02:42:15.416634+00	\N
019dfb3c-d019-714c-b4df-8cd64d178a28	knqOAhTPM3NDkg4CP9524H4rnTgVi+uCY3ZLYlMbDhPKGhxd0f/qlJxiujkgs571PuJOVzF7Q84lkXjI9+Gtxw==	2026-05-13 03:02:39.584961+00	2026-05-07 02:42:14.313566+00	2026-05-07 02:43:14.313567+00	FuNzdbuWYl7C+uZ+bQaVja17Lzrsfr40kXaZ3TBDKv86MY752bS3lso7Newiswbt9eHE0re+hVA17WloKsJwbA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-06 03:02:39.992164+00	00000000-0000-0000-0000-000000000000	2026-05-07 02:42:15.417258+00	\N
019e0056-7195-7733-8f2f-7b8b41883c82	B7NhG0B7OPSC0hvjzDzqPxTJ3TNm6a7/u8nQ0HC4cfTvraWB+2m0ptbtqOcTOY3dsWIhmHFT3Q2i5As5wSqE9A==	2026-05-14 02:48:45.715465+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 02:48:45.717747+00	00000000-0000-0000-0000-000000000000	2026-05-07 02:48:45.717747+00	\N
019e0042-36c5-7c38-ad52-cb129dc6c311	1h6NodXtiMza9ZzQejqsmg34UpFb7dzfIiRMAy5bZecg4MZbuQJTioP9ZBDpAEVYVcqp3vtQvcv5Q0N+oQ4ePA==	2026-05-14 02:26:39.940445+00	2026-05-07 02:58:22.712741+00	2026-05-07 02:59:22.712741+00	+unYx9ETkocqrmkzVy3K0Htcd8sAFQlHUPZiDD0FUzMpTURXwjnsXOlPOEbMUM6MIuSnP6mKJIUB7ON+0oPQ7A==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 02:26:39.941958+00	00000000-0000-0000-0000-000000000000	2026-05-07 02:58:22.713164+00	\N
019e005f-8dfe-7811-a125-778c4f26dafe	jsyvJbtKez9IRIRAgQt3izvy1vJRcIa+3aAhWLmOKuePGpWq5+BQO8Kss1Q8ZaoOGDsN6AP6xhi6ES0gpNQcZw==	2026-05-14 02:58:42.81395+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 02:58:42.814496+00	00000000-0000-0000-0000-000000000000	2026-05-07 02:58:42.814496+00	\N
019e006a-c38c-7e59-a37b-8a6195cd99e1	xHySP1w8RKp9aRo0TX9OCGGDBWAz+eURwhLgzmzZkqk20h7SKpLLv8BCHTtPeP1iS2HPqDZ1zGYJqIZl1l7PgQ==	2026-05-14 03:10:57.420294+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 03:10:57.420652+00	00000000-0000-0000-0000-000000000000	2026-05-07 03:10:57.420652+00	\N
019e005f-3f78-7e70-9447-dbca32f62e8b	+unYx9ETkocqrmkzVy3K0Htcd8sAFQlHUPZiDD0FUzMpTURXwjnsXOlPOEbMUM6MIuSnP6mKJIUB7ON+0oPQ7A==	2026-05-14 02:58:22.712743+00	2026-05-07 03:24:31.60978+00	2026-05-07 03:25:31.60978+00	eP9D7xOROGMdRrLCu2P/oW5qK7WTu5kVKrK9IOQC0CKsDCNoWu7Ha7/N9jk8iMc+yK2QZwK4oYJzjbWa4bfbzQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 02:58:22.713146+00	00000000-0000-0000-0000-000000000000	2026-05-07 03:24:31.610077+00	\N
019e006f-9b61-705a-bb1a-5a76bf14a6e0	vbPvBHeCVSY8ELnbQnZa8wBx5yj1xi7RFP83d+OdCiaIzm5HFiRAqpTiWXaKG78bI6kT2M8iQuXhRVSoVcPNDg==	2026-05-14 03:16:14.817272+00	2026-05-07 03:42:55.412047+00	2026-05-07 03:43:55.412047+00	fYOMv3IFGDzonkF6nDQ0uSIrhnoyqezwNmlByzfly6ESAH8E0EulUOPeYRkWf4vvdpcQZg55dyuqWR5XeCDCww==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 03:16:14.81766+00	00000000-0000-0000-0000-000000000000	2026-05-07 03:42:55.412392+00	\N
019e0077-2ff9-7234-88cb-a8cafc962108	eP9D7xOROGMdRrLCu2P/oW5qK7WTu5kVKrK9IOQC0CKsDCNoWu7Ha7/N9jk8iMc+yK2QZwK4oYJzjbWa4bfbzQ==	2026-05-14 03:24:31.609782+00	2026-05-07 03:46:27.23811+00	2026-05-07 03:47:27.23816+00	ekhiNYTjHCHElwBKzk4Do4uNbxrkOz5Baf1m/AsIjG5a+Y77FXcNLZOLdR0TBH11TF2Ni1BPeLYiPdCHQsFmqg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 03:24:31.610049+00	00000000-0000-0000-0000-000000000000	2026-05-07 03:46:27.291065+00	\N
019e0088-07b4-7a45-8963-632b7d8f4344	fYOMv3IFGDzonkF6nDQ0uSIrhnoyqezwNmlByzfly6ESAH8E0EulUOPeYRkWf4vvdpcQZg55dyuqWR5XeCDCww==	2026-05-14 03:42:55.412049+00	2026-05-07 03:46:30.572259+00	2026-05-07 03:47:30.572259+00	AJPOPb3ehFrkDsi/UDdMGXuXgDHMEotPfO2zbD8Ymn4ojpyyc5nCgY6jeqkP554cNbFwSTuPp5QmshN5O0ywYQ==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 03:42:55.412378+00	00000000-0000-0000-0000-000000000000	2026-05-07 03:46:30.574328+00	\N
019e008b-502e-7054-be0a-03fd1b7fcf48	AJPOPb3ehFrkDsi/UDdMGXuXgDHMEotPfO2zbD8Ymn4ojpyyc5nCgY6jeqkP554cNbFwSTuPp5QmshN5O0ywYQ==	2026-05-14 03:46:30.572269+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 03:46:30.574307+00	00000000-0000-0000-0000-000000000000	2026-05-07 03:46:30.574307+00	\N
019e0050-7c34-7a6c-ad9c-e713399cf4f0	FuNzdbuWYl7C+uZ+bQaVja17Lzrsfr40kXaZ3TBDKv86MY752bS3lso7Newiswbt9eHE0re+hVA17WloKsJwbA==	2026-05-14 02:42:14.313569+00	2026-05-07 11:23:43.553196+00	2026-05-07 11:24:43.553237+00	MdxttDTZGymfgH78p/Heuh//XhKfysrPH1RD/HQcRP/rQG9HgHjj2PH/FZw8AdU8mcdxGG+K5JW3kuxtXcLr6Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 02:42:15.416522+00	00000000-0000-0000-0000-000000000000	2026-05-07 11:23:44.262211+00	\N
019e008b-4352-78a3-83e5-06ea2dc7f3a8	ekhiNYTjHCHElwBKzk4Do4uNbxrkOz5Baf1m/AsIjG5a+Y77FXcNLZOLdR0TBH11TF2Ni1BPeLYiPdCHQsFmqg==	2026-05-14 03:46:27.238812+00	2026-05-07 11:28:50.903929+00	2026-05-07 11:29:50.903974+00	m6pZ2zJkhnBOKQEirkSdYi08cY73QwCTgWrxMi6nfTJ4xJZFY6k43pq71jtpbRewOPlylu4+YC1hPaDVftoSzg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 03:46:27.290495+00	00000000-0000-0000-0000-000000000000	2026-05-07 11:28:50.953262+00	\N
019e023f-1808-79d9-ab19-17d4ca862d8f	uhCtaiZjrRML6KmwtrLPTJTOXz1uYBv5HeX8xj8DNdEGXBqM3bjT/11k/2pVcb6m3yfu3wnLNzGPLAowO68lqQ==	2026-05-14 11:42:29.894798+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 11:42:29.896606+00	00000000-0000-0000-0000-000000000000	2026-05-07 11:42:29.896606+00	\N
019e0232-9902-74bf-b3f8-fdfb5bf13fbf	m6pZ2zJkhnBOKQEirkSdYi08cY73QwCTgWrxMi6nfTJ4xJZFY6k43pq71jtpbRewOPlylu4+YC1hPaDVftoSzg==	2026-05-14 11:28:50.904685+00	2026-05-07 12:01:19.198959+00	2026-05-07 12:02:19.198959+00	7+uDMyHMD0UtPYmX+uGuZJk9YGqIskULQVxd4FNjpilYoNJR9QvMM9aMpU87j6SsTtTDI7LWGgjp0SrvN+sWAg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 11:28:50.952795+00	00000000-0000-0000-0000-000000000000	2026-05-07 12:01:19.199267+00	\N
019e0250-535f-7853-8147-d508c3496d5c	7+uDMyHMD0UtPYmX+uGuZJk9YGqIskULQVxd4FNjpilYoNJR9QvMM9aMpU87j6SsTtTDI7LWGgjp0SrvN+sWAg==	2026-05-14 12:01:19.198961+00	2026-05-07 12:25:15.73318+00	2026-05-07 12:26:15.73318+00	KTL58ywXmL1IvNqz+rhulnROpLohYTu2SNiBijLgNIzv2jJEBM7dVV2GRX4iNldMPAJzxC7WpZ7b95n4ojtJCg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 12:01:19.199255+00	00000000-0000-0000-0000-000000000000	2026-05-07 12:25:15.733451+00	\N
019e0266-3ed5-75bb-b55a-1a8f35045bd0	KTL58ywXmL1IvNqz+rhulnROpLohYTu2SNiBijLgNIzv2jJEBM7dVV2GRX4iNldMPAJzxC7WpZ7b95n4ojtJCg==	2026-05-14 12:25:15.733182+00	2026-05-07 12:48:30.779408+00	2026-05-07 12:49:30.779409+00	dw9J0FR61fUGBFa2uiWMNa05bPVQb+Ac55RlFaUFnmsMANUJnCkw2eSCazL/3HqR0/qmlx7vzdpBnHztAp43tg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 12:25:15.733435+00	00000000-0000-0000-0000-000000000000	2026-05-07 12:48:30.779735+00	\N
019e027b-883b-7027-9178-cfdc3d68a8ca	dw9J0FR61fUGBFa2uiWMNa05bPVQb+Ac55RlFaUFnmsMANUJnCkw2eSCazL/3HqR0/qmlx7vzdpBnHztAp43tg==	2026-05-14 12:48:30.779412+00	2026-05-07 13:19:25.999006+00	2026-05-07 13:20:25.999006+00	yCTvunakyuFvexY7EDhkQYhz3OFWTnps25V1zknQNTGifqjXrd0/fTmhhj+1TTdfnCXVBM+1ZVgMvSPDBdYBMQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 12:48:30.779719+00	00000000-0000-0000-0000-000000000000	2026-05-07 13:19:25.999209+00	\N
019e0297-d72f-7153-aea3-40f1560441de	yCTvunakyuFvexY7EDhkQYhz3OFWTnps25V1zknQNTGifqjXrd0/fTmhhj+1TTdfnCXVBM+1ZVgMvSPDBdYBMQ==	2026-05-14 13:19:25.999008+00	2026-05-07 13:24:18.468987+00	2026-05-07 13:25:18.469018+00	mY3qTz3t/0jD6EHb6IqZI8FFOaWaphNZOh4F8iVazoHrRFE7BZXDfi9IYkdnjWA5nISb7ul4fulwG+r+1fHcLw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 13:19:25.999195+00	00000000-0000-0000-0000-000000000000	2026-05-07 13:24:19.367085+00	\N
019e022d-eafc-7e72-a747-f0323ab5110a	MdxttDTZGymfgH78p/Heuh//XhKfysrPH1RD/HQcRP/rQG9HgHjj2PH/FZw8AdU8mcdxGG+K5JW3kuxtXcLr6Q==	2026-05-14 11:23:43.554139+00	2026-05-07 13:28:57.531073+00	2026-05-07 13:29:57.531112+00	DPe84Rwxg4N5flvsK174NvPfSTe788M3Hon/UUxBvReRQDq6pi5TNKQoOG1qSJ65hCGtSQxoIyysxlhavTRDEA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 11:23:44.261708+00	00000000-0000-0000-0000-000000000000	2026-05-07 13:28:58.531027+00	\N
019e02a1-b0ce-7c67-a1f5-742ff465e466	GI6RbEUDzXw2Q+8ddRB6n2Eo8gbzjDuV3JCHmqUc2kIPU5iknzCK94G3fnYf9zfGEfD/BlhJg/m1Cg8ZSRfe/w==	2026-05-14 13:30:11.531941+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 13:30:11.53474+00	00000000-0000-0000-0000-000000000000	2026-05-07 13:30:11.53474+00	\N
019e029c-50c3-7b42-9c9c-76b2d727049c	mY3qTz3t/0jD6EHb6IqZI8FFOaWaphNZOh4F8iVazoHrRFE7BZXDfi9IYkdnjWA5nISb7ul4fulwG+r+1fHcLw==	2026-05-14 13:24:18.470121+00	2026-05-07 13:56:18.563856+00	2026-05-07 13:57:18.563856+00	SLxzKQT4EPkffPJiLITQPOvUEWrXkA/6htHorkszWpj/TtrtyPl54VMRqqB53sQwfgqc3qRbc6b64W3GyEs2ew==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 13:24:19.366298+00	00000000-0000-0000-0000-000000000000	2026-05-07 13:56:18.564263+00	\N
019e02a0-9342-7cfa-906c-5067607b2811	DPe84Rwxg4N5flvsK174NvPfSTe788M3Hon/UUxBvReRQDq6pi5TNKQoOG1qSJ65hCGtSQxoIyysxlhavTRDEA==	2026-05-14 13:28:57.532114+00	2026-05-08 03:49:11.736303+00	2026-05-08 03:50:11.736335+00	0PSnF4+hNfzVPTGdaX7y8kkeRNgTubrFmEfWtSrIX0OXADSQjJFvBw7z8FzR2VQBlgMo5e3LKhx0IxKY2NpslQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 13:28:58.530424+00	00000000-0000-0000-0000-000000000000	2026-05-08 03:49:12.239499+00	\N
019e02c3-1345-7386-abe5-5cea032301cf	FTa98Z/lC7JbmzXEtcCsZ8vvXv/TVKQUN35XyOShWQ5Y2ZoBUrLkuP2mXB+DyGjCQkEAfBdTlvUYzrdni7zcUg==	2026-05-14 14:06:39.428744+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 14:06:39.429335+00	00000000-0000-0000-0000-000000000000	2026-05-07 14:06:39.429335+00	\N
019e02b9-9a04-7504-9125-09739cf6d660	SLxzKQT4EPkffPJiLITQPOvUEWrXkA/6htHorkszWpj/TtrtyPl54VMRqqB53sQwfgqc3qRbc6b64W3GyEs2ew==	2026-05-14 13:56:18.563859+00	2026-05-07 14:40:13.278876+00	2026-05-07 14:41:13.278914+00	1NVHtVYevaw28mioVO+cmahJDhvGPUVgGq8SmN/SSXZ/lX1DK3Z2bGviBq4m2x6SMBnFY61j3YwvwgnIQMb1ww==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 13:56:18.564243+00	00000000-0000-0000-0000-000000000000	2026-05-07 14:40:14.278113+00	\N
019e02e1-d167-7b10-be13-c1cf5a128323	1NVHtVYevaw28mioVO+cmahJDhvGPUVgGq8SmN/SSXZ/lX1DK3Z2bGviBq4m2x6SMBnFY61j3YwvwgnIQMb1ww==	2026-05-14 14:40:13.279985+00	2026-05-07 15:51:50.245434+00	2026-05-07 15:52:50.245469+00	WQ0xXAUZxJhZXq9kkgPcvSsPum3dyx6U/kdFoz1os8sHl5XPS9hucinsj72fpo7niAT1ZRHb3h6vuShuoniHuw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 14:40:14.277497+00	00000000-0000-0000-0000-000000000000	2026-05-07 15:51:51.150639+00	\N
019e0329-c39a-794e-be72-d90ae856a060	Sj0Jhg8IezPOsEUTT8Rmdu1OOl0TRn94hIBJbk/ZqcxZ+D0SJOPirZIu7r/Qii1tigaHWP+bYGbVf3cd4yHfLA==	2026-05-14 15:58:49.241723+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 15:58:49.24226+00	00000000-0000-0000-0000-000000000000	2026-05-07 15:58:49.24226+00	\N
019e032c-9a8c-7488-a276-6dd1e651daed	8RGHPZBko1tV3fKTD2fHZeUVK0mObTWTeWqJ6jCL0XpxlNBW9qIux122iqqmMuBpgTekPrVpo13xSGlIsNDxNA==	2026-05-14 16:01:55.340373+00	2026-05-07 16:54:08.921893+00	2026-05-07 16:55:08.92193+00	n7ihfHUygA3LHjFREnzn/PRaIQAeQ1dLGCzUWbpf4yZA+rRxaOSovqcE+xvr55/Cg+jxcWMBtYxzPYB8IznmFg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 16:01:55.340901+00	00000000-0000-0000-0000-000000000000	2026-05-07 16:54:09.614222+00	\N
019e035c-6d70-7378-b095-3e215e1c4ee0	n7ihfHUygA3LHjFREnzn/PRaIQAeQ1dLGCzUWbpf4yZA+rRxaOSovqcE+xvr55/Cg+jxcWMBtYxzPYB8IznmFg==	2026-05-14 16:54:08.923261+00	2026-05-07 17:37:23.646077+00	2026-05-07 17:38:23.64611+00	aDmDGdmt9ISD7HL+J3PlG29Irh4BlJGA0xBo7WkGG90+rjZeE2+NjF3g049gQvZ+s45Gl1tbZtJUQdcI6iKp+Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 16:54:09.613273+00	00000000-0000-0000-0000-000000000000	2026-05-07 17:37:24.246676+00	\N
019e0384-04b4-71b4-83d2-8e906a044f20	aDmDGdmt9ISD7HL+J3PlG29Irh4BlJGA0xBo7WkGG90+rjZeE2+NjF3g049gQvZ+s45Gl1tbZtJUQdcI6iKp+Q==	2026-05-14 17:37:23.646952+00	2026-05-07 23:12:22.358343+00	2026-05-07 23:13:22.358409+00	CyoSpF4nK4rrc/fIFrxHcLZXTRcsNvF7VJ3f6FVY409dbzvulrriE/Y+Ao8tk0RaPphsvWZR3ceNA6sCultISA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 17:37:24.245923+00	00000000-0000-0000-0000-000000000000	2026-05-07 23:12:22.416543+00	\N
019e04b8-1460-7b2b-857d-fd45a2ded7ac	owWv6xnhSC73YX7qGOUfssFoxBgg+ZHe+ZEj7IiIFyGHEfwDYkHBUg+SZaqNv/bbjNgmox8u2CQtqPW3yRjgSg==	2026-05-14 23:13:53.247205+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-07 23:13:53.24936+00	00000000-0000-0000-0000-000000000000	2026-05-07 23:13:53.24936+00	\N
019e04b6-b187-78ef-b168-85a378c8e6d8	CyoSpF4nK4rrc/fIFrxHcLZXTRcsNvF7VJ3f6FVY409dbzvulrriE/Y+Ao8tk0RaPphsvWZR3ceNA6sCultISA==	2026-05-14 23:12:22.359274+00	2026-05-07 23:35:37.422301+00	2026-05-07 23:36:37.422301+00	i+6u+Kd4b1yHMNEiT0qlfaE0Wj431PJA4bVTurkNi9mjNyprJYcjXOQiIUu3n7+CfdaEp48P6jSxlygnw5EMYQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 23:12:22.415773+00	00000000-0000-0000-0000-000000000000	2026-05-07 23:35:37.42256+00	\N
019e04cb-face-78c4-b923-a38e04168628	i+6u+Kd4b1yHMNEiT0qlfaE0Wj431PJA4bVTurkNi9mjNyprJYcjXOQiIUu3n7+CfdaEp48P6jSxlygnw5EMYQ==	2026-05-14 23:35:37.422309+00	2026-05-07 23:56:15.477737+00	2026-05-07 23:57:15.477737+00	773ys2I92aiXmDSbakIXbNnvWTkdrjjxET2zJmosfNbibSceWoVVvb5vS2heAhjTJpgV9AAQTvvcEln3tNQ3UA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 23:35:37.422546+00	00000000-0000-0000-0000-000000000000	2026-05-07 23:56:15.478275+00	\N
019e04de-def6-7325-aea5-2049123bc772	773ys2I92aiXmDSbakIXbNnvWTkdrjjxET2zJmosfNbibSceWoVVvb5vS2heAhjTJpgV9AAQTvvcEln3tNQ3UA==	2026-05-14 23:56:15.477743+00	2026-05-08 00:23:07.197258+00	2026-05-08 00:24:07.197258+00	JkwwV1s9uaRrs+2PgkfpOBq8UjInF1hcQq7DuYhV6dbQqGBQSO4CuVOVLx6mJS+reW30wWbha9K8eltZhEzRUw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 23:56:15.478241+00	00000000-0000-0000-0000-000000000000	2026-05-08 00:23:07.197741+00	\N
019e04f7-76bd-72dc-877d-3a7351380a00	JkwwV1s9uaRrs+2PgkfpOBq8UjInF1hcQq7DuYhV6dbQqGBQSO4CuVOVLx6mJS+reW30wWbha9K8eltZhEzRUw==	2026-05-15 00:23:07.197261+00	2026-05-08 02:57:36.41946+00	2026-05-08 02:58:36.41946+00	7/SoCIi27Kws73aEURj71ohu4rAj4G7xz9wwEGFbMuCMO2vly4EueW6Ugov5I1YYrnBeG5/8ATr7EnrbNY5HAQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 00:23:07.197721+00	00000000-0000-0000-0000-000000000000	2026-05-08 02:57:36.420276+00	\N
019e0584-e6a4-72a1-830c-d4dd13178a0a	7/SoCIi27Kws73aEURj71ohu4rAj4G7xz9wwEGFbMuCMO2vly4EueW6Ugov5I1YYrnBeG5/8ATr7EnrbNY5HAQ==	2026-05-15 02:57:36.419469+00	2026-05-08 03:17:51.021943+00	2026-05-08 03:18:51.021943+00	1nO5csqKV1sB6E7YgdI+TkIapBQMAZdLyBL0bIh5Vcl0iid8gRcyfbYDa7Ao2rFEIlfqA/rhDGzHqPh4jDJkBQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 02:57:36.420217+00	00000000-0000-0000-0000-000000000000	2026-05-08 03:17:51.022749+00	\N
019e059b-25a1-79b2-abc1-ca5485d5c1f6	Ka2GkR/sR30+u8AHCXn5NMpOS2K/1oCgTKOaPZtkW0m1dpGpKQCwLnyYJInVPHiZelNMsqOhQatmEAFW8n61qw==	2026-05-15 03:21:54.337308+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-08 03:21:54.337512+00	00000000-0000-0000-0000-000000000000	2026-05-08 03:21:54.337512+00	\N
019e0597-6f2e-75b4-8ca5-eb4f36e5fe37	1nO5csqKV1sB6E7YgdI+TkIapBQMAZdLyBL0bIh5Vcl0iid8gRcyfbYDa7Ao2rFEIlfqA/rhDGzHqPh4jDJkBQ==	2026-05-15 03:17:51.021948+00	2026-05-08 03:45:38.030542+00	2026-05-08 03:46:38.030584+00	IJU1M/G0ryKFiUMccVXeNmPoj6ciT1XvH6VfBqNj9BvBpMB/JOrf9Vu3aTwZiPfcqjMZ42X/33x68OYrOS/Xyw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 03:17:51.022631+00	00000000-0000-0000-0000-000000000000	2026-05-08 03:45:38.637422+00	\N
019e05b0-e141-743f-9d10-b965981bd683	IJU1M/G0ryKFiUMccVXeNmPoj6ciT1XvH6VfBqNj9BvBpMB/JOrf9Vu3aTwZiPfcqjMZ42X/33x68OYrOS/Xyw==	2026-05-15 03:45:38.031446+00	2026-05-08 20:10:42.199207+00	2026-05-08 20:11:42.199257+00	JDAwnBX1fNhJKH8kBBIZdkBFKFT0lU8r2P/LeoGWkDvHZyo53R2gQAE5EjIIT3KDJylgDvK6ylC+62YBoJ85KA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 03:45:38.636513+00	00000000-0000-0000-0000-000000000000	2026-05-08 20:10:43.299643+00	\N
019e05b4-23a1-701c-a11d-d43016f6b88f	0PSnF4+hNfzVPTGdaX7y8kkeRNgTubrFmEfWtSrIX0OXADSQjJFvBw7z8FzR2VQBlgMo5e3LKhx0IxKY2NpslQ==	2026-05-15 03:49:11.73721+00	2026-05-08 20:37:34.593685+00	2026-05-08 20:38:34.593685+00	wgOse3aQR8GDe/hDiaDTep1I7/vQOYjm7zvRaem8wTcBLW0wNCAmW/NyzqU0Hyop0HzWQBpH47J56eD5mzkEOw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 03:49:12.2388+00	00000000-0000-0000-0000-000000000000	2026-05-08 20:37:34.593965+00	\N
019e00f0-984a-7c6f-90a6-293b1a59731d	HLLQO42VqQ5xI8AUreAg5I/ClgIGCaYAbFwneKDyajGZLIxx2KHiH+qUAZIOUMkstYkwA1En/ygkbOs5C1hm4g==	2026-05-14 05:37:08.16912+00	2026-05-08 10:07:25.310039+00	2026-05-08 10:08:25.394764+00	dDxJFs9nNMi4AAzSCR0ZZapuqDpHexKj6yNNJP8DcZOFpYXHdQaOEMqHR9WVgkkSu5419lsPhddQirjC7pk36A==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 05:37:08.170744+00	00000000-0000-0000-0000-000000000000	2026-05-08 10:07:25.900774+00	\N
019e0777-bfa4-7979-bb52-4d144232adab	/abRWuWCvYfsoTYhNwN0qhDr4dcJX0matVmseqjDOTUTWnzD3vS8nIoK1J7ZJtZ7m8105LMnw57D5VDjy9HI4Q==	2026-05-15 12:02:28.506139+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-08 12:02:29.193877+00	00000000-0000-0000-0000-000000000000	2026-05-08 12:02:29.193877+00	\N
019e0937-2f01-75f0-9682-f4f40f355703	hGnRjLesRM8GkKdEBA+XNeN8ESvd5xtBBGOq/Sw8xip26cTKxaVAlC8EqI1d+fCmgpLMBHCwlGK4GYqrTwamxA==	2026-05-15 20:11:11.999206+00	2026-05-08 20:35:01.483784+00	2026-05-08 20:36:01.483785+00	sf7WHPz7jyjRLv/WRRMKs9tf2pxigcvmc6xqb+WEKDX7c5Jt8Gu1rz4Mnauj66tiqHd86xDgqWL7lTgBrlkngQ==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-08 20:11:12.094566+00	00000000-0000-0000-0000-000000000000	2026-05-08 20:35:01.484217+00	\N
019e094c-feec-7a8e-9dcb-6c8b469b986d	sf7WHPz7jyjRLv/WRRMKs9tf2pxigcvmc6xqb+WEKDX7c5Jt8Gu1rz4Mnauj66tiqHd86xDgqWL7lTgBrlkngQ==	2026-05-15 20:35:01.483787+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-08 20:35:01.484197+00	00000000-0000-0000-0000-000000000000	2026-05-08 20:35:01.484197+00	\N
019e0936-be7b-7add-b32b-84c53fb9aeb7	JDAwnBX1fNhJKH8kBBIZdkBFKFT0lU8r2P/LeoGWkDvHZyo53R2gQAE5EjIIT3KDJylgDvK6ylC+62YBoJ85KA==	2026-05-15 20:10:42.200231+00	2026-05-08 20:40:20.33442+00	2026-05-08 20:41:20.33442+00	U9NLQjDU99I8Uv/hhO2sGRrg93CKgoF/fCp9UIWgdZvX6EvqCBzEiwDiS00Fbb9VA0VekCyWjXIhkSi9KVedHA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 20:10:43.299177+00	00000000-0000-0000-0000-000000000000	2026-05-08 20:40:20.3347+00	\N
019e0946-db6e-7499-9f51-40f293d74e03	omd9iLVDTw8K39S+LczJc58ciWps1KYjBZxyZMxPFAD7byY+Z97kM9uKKTgVnK+k/06HL0J4d4jyeEbkZm7j0Q==	2026-05-15 20:28:19.18224+00	2026-05-08 20:48:29.082881+00	2026-05-08 20:49:29.082882+00	eg+2OB5Qg4AbonFskFhZp+/lnH55dxBdNvLRUF3/7wTzyTlPCoai0k3iHyXQB8ok27byXlistYWmuB6ecE9AaA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 20:28:19.182765+00	00000000-0000-0000-0000-000000000000	2026-05-08 20:48:29.08317+00	\N
019e094f-5501-701b-aa44-0b9cecb3ea81	wgOse3aQR8GDe/hDiaDTep1I7/vQOYjm7zvRaem8wTcBLW0wNCAmW/NyzqU0Hyop0HzWQBpH47J56eD5mzkEOw==	2026-05-15 20:37:34.593687+00	2026-05-08 20:58:06.809661+00	2026-05-08 20:59:06.809662+00	tSihlbzlCbbJYFtS54INzWTTL8Lk/nYcLtiBfG1yAlIJMlaJUNKGs6k6+3DxiOi4NjS2yXdZIaf0PSYc/cKVdg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 20:37:34.59395+00	00000000-0000-0000-0000-000000000000	2026-05-08 20:58:06.810224+00	\N
019e0951-dc6e-7f0c-bee6-214cd97511d2	U9NLQjDU99I8Uv/hhO2sGRrg93CKgoF/fCp9UIWgdZvX6EvqCBzEiwDiS00Fbb9VA0VekCyWjXIhkSi9KVedHA==	2026-05-15 20:40:20.334422+00	2026-05-08 21:22:29.752075+00	2026-05-08 21:23:29.752111+00	T+nZhC6x6YiLTRqdUUoecXeZVe3TN0+WzJuWqmcCaZ3zZwO/Ma4G+f4ytSGf9x5ix5vo8SMoU3QyZZglPKsahw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 20:40:20.334679+00	00000000-0000-0000-0000-000000000000	2026-05-08 21:22:30.752775+00	\N
019e0959-519b-71fc-89da-e3bd87945dbc	eg+2OB5Qg4AbonFskFhZp+/lnH55dxBdNvLRUF3/7wTzyTlPCoai0k3iHyXQB8ok27byXlistYWmuB6ecE9AaA==	2026-05-15 20:48:29.082884+00	2026-05-08 21:28:52.80544+00	2026-05-08 21:29:52.80544+00	+jW8SDrHaDXoiQPj67PmGT559on8ojSiJCQyuTZgfqMFMDff3KljgrA+rLqFqQK+EjKYCituvWF+nWDFlMyplg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 20:48:29.083147+00	00000000-0000-0000-0000-000000000000	2026-05-08 21:28:52.80676+00	\N
019e0978-7880-776b-b7e5-26ad0fe1468f	T+nZhC6x6YiLTRqdUUoecXeZVe3TN0+WzJuWqmcCaZ3zZwO/Ma4G+f4ytSGf9x5ix5vo8SMoU3QyZZglPKsahw==	2026-05-15 21:22:29.753163+00	2026-05-08 21:45:38.184855+00	2026-05-08 21:46:38.184855+00	ohBld0vlL+FJMu/mnr+XgQWBzj7SqmOJIIY4H/UP06+ycTIaDhJZuo2NgkgIOAXmVteosu0VQZr8pV1agfoRxQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 21:22:30.752226+00	00000000-0000-0000-0000-000000000000	2026-05-08 21:45:38.185282+00	\N
019e0992-38ab-74b5-9c8a-3c6c3fbfd8ca	BjRnRLwiePU5R+993jAuf4TSrRLh57F+FYXIIpc7daGzt5pfrI/ZVKF9S3JdcfHOYK5anensEic5MkmJmHWfXA==	2026-05-15 21:50:38.250874+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 21:50:38.251292+00	00000000-0000-0000-0000-000000000000	2026-05-08 21:50:38.251292+00	\N
019e097e-4d46-7fec-9a16-056fb18ccac7	+jW8SDrHaDXoiQPj67PmGT559on8ojSiJCQyuTZgfqMFMDff3KljgrA+rLqFqQK+EjKYCituvWF+nWDFlMyplg==	2026-05-15 21:28:52.805443+00	2026-05-08 21:58:00.915108+00	2026-05-08 21:59:00.915108+00	YZMjIVbpXIsp8uUlniulW1iziLMdEtZwxX5F/QeWRvk8z+T3yK55E0qJZn3ebhw/c4lYoPh1l9dsqizoztjPZA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 21:28:52.806742+00	00000000-0000-0000-0000-000000000000	2026-05-08 21:58:00.915418+00	\N
019e0995-a2ea-786e-b705-9957de02f907	paBvMiYS542OIDW79cAfR6WoaE9qT/18tJMSv5L66cGyyz0WK4KHNl3YVp+iiDpfIV4V5XmZHt8rVCrJczwLDw==	2026-05-15 21:54:22.057776+00	2026-05-09 07:06:09.914752+00	2026-05-09 07:07:09.914794+00	fOXYczLIjcVpnGjqzyNmxrtDrlpI9tGHCqokKk/UatYaUh/hP/Q+7PVFFSdKMg8hPK1FNcrBjnq4UDP7DqNSfg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 21:54:22.05824+00	00000000-0000-0000-0000-000000000000	2026-05-09 07:06:10.603899+00	\N
019e0b8e-d4c7-7d33-b4a1-e9d4ccc44005	fOXYczLIjcVpnGjqzyNmxrtDrlpI9tGHCqokKk/UatYaUh/hP/Q+7PVFFSdKMg8hPK1FNcrBjnq4UDP7DqNSfg==	2026-05-16 07:06:09.91579+00	2026-05-09 07:17:18.534574+00	2026-05-09 07:18:18.53463+00	5pSmAe02M8R8cdRIn0C7XBSjUFN8r5VXTXIx21mi7nkhAur3clcdZBHVdOwGR+hBK9RvaatejXxZJJMW9cMsMg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 07:06:10.602728+00	00000000-0000-0000-0000-000000000000	2026-05-09 07:17:18.589471+00	\N
019e0b99-0674-77c4-80d4-2aa1aa7fb6b2	5pSmAe02M8R8cdRIn0C7XBSjUFN8r5VXTXIx21mi7nkhAur3clcdZBHVdOwGR+hBK9RvaatejXxZJJMW9cMsMg==	2026-05-16 07:17:18.535376+00	2026-05-09 07:35:42.834345+00	2026-05-09 07:36:42.834373+00	2lvi8M4USgxiW+/wIMqFDKlpgfow++B3BmisovUmIbtGKfK0yHHKINJ421gT+feexWIN6g8sGxj8DR8+9BrGtw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 07:17:18.588719+00	00000000-0000-0000-0000-000000000000	2026-05-09 07:35:43.337898+00	\N
019e0ba9-e1dd-7328-8ae1-1726f3ff97aa	2lvi8M4USgxiW+/wIMqFDKlpgfow++B3BmisovUmIbtGKfK0yHHKINJ421gT+feexWIN6g8sGxj8DR8+9BrGtw==	2026-05-16 07:35:42.835173+00	2026-05-09 08:12:33.510425+00	2026-05-09 08:13:33.510472+00	vmqHIgRuDl2SidaPKDFY/zU3WAS6Kj4alZ41AtRayh0Fv6nst3h/gTqLL3pUfvCi9MLzAF0TY1goSlgTDL5W/g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 07:35:43.337208+00	00000000-0000-0000-0000-000000000000	2026-05-09 08:12:34.01488+00	\N
019e0bcb-9cfd-7c94-92df-c78ee6090a0c	vmqHIgRuDl2SidaPKDFY/zU3WAS6Kj4alZ41AtRayh0Fv6nst3h/gTqLL3pUfvCi9MLzAF0TY1goSlgTDL5W/g==	2026-05-16 08:12:33.511479+00	2026-05-09 09:06:12.856719+00	2026-05-09 09:07:12.85675+00	r2AsRmtMgWKwdiCZIKkWzWfZ+F154vTo6kSX+TxDMRrz8EgJZCf5DjxkYJa8SZYgq1ZJmSXYJmIeHQjRGjdOWA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 08:12:34.014182+00	00000000-0000-0000-0000-000000000000	2026-05-09 09:06:13.361292+00	\N
019e0bfc-bc8d-7990-bc58-57386fea67ef	r2AsRmtMgWKwdiCZIKkWzWfZ+F154vTo6kSX+TxDMRrz8EgJZCf5DjxkYJa8SZYgq1ZJmSXYJmIeHQjRGjdOWA==	2026-05-16 09:06:12.857518+00	2026-05-09 10:42:33.766514+00	2026-05-09 10:43:33.766549+00	iX5STwinUO/Gm+G7gk55Y0LPYTb1H5gPHwTBgGF91RiSWmCVgDHBGjeB2P+0p5BdHELnwGzrx3+JgZwBnQvjvQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 09:06:13.360531+00	00000000-0000-0000-0000-000000000000	2026-05-09 10:42:34.354914+00	\N
019e0962-225a-7334-a1b4-8b047f0960e4	tSihlbzlCbbJYFtS54INzWTTL8Lk/nYcLtiBfG1yAlIJMlaJUNKGs6k6+3DxiOi4NjS2yXdZIaf0PSYc/cKVdg==	2026-05-15 20:58:06.809665+00	2026-05-09 10:52:29.000732+00	2026-05-09 10:53:29.000774+00	nM7fBWn99nOckHfhp231WaiXq1Myl8HTYBzofcvxnBjokhEcLsk/KqsvgCrZD6GVRddLwHIUZffdxapIw8Yt5Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 20:58:06.810203+00	00000000-0000-0000-0000-000000000000	2026-05-09 10:52:29.411152+00	\N
019e0c68-36eb-7ca4-860d-87998a508610	vALrKsmCz6q9Mvou19hhR7HCZRVjGzPWCtAM9iIFNuGtH3fV8sO/NppHiTN90a3teZOG9Fzf16GxwaxlWFr8Jg==	2026-05-16 11:03:36.938679+00	2026-05-09 11:30:26.433799+00	2026-05-09 11:31:26.433799+00	m3GB6zaKI1dHw4kZR3kbV2iq7JqVW7OgSevrEwjZqQe0nI0jff30BwrpirvL7bj6PV/OHIHKDGh+iX/vPvvlVg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 11:03:36.939959+00	00000000-0000-0000-0000-000000000000	2026-05-09 11:30:26.43412+00	\N
019e0c68-366a-7b80-9f22-524eef798827	+/0jNKL7JY53XwQTCfVbrmbGK4s5Bfly2sCNkTqXAyNXtZpSxSb0eM8PMtCl49kTE8jrF2cB81THGnStV6bKQA==	2026-05-16 11:03:36.808793+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 11:03:36.811047+00	00000000-0000-0000-0000-000000000000	2026-05-09 11:03:36.811047+00	\N
019e0c54-f291-72b2-a6dd-e7de959194b4	iX5STwinUO/Gm+G7gk55Y0LPYTb1H5gPHwTBgGF91RiSWmCVgDHBGjeB2P+0p5BdHELnwGzrx3+JgZwBnQvjvQ==	2026-05-16 10:42:33.767516+00	2026-05-09 11:03:36.938677+00	2026-05-09 11:04:36.938677+00	vALrKsmCz6q9Mvou19hhR7HCZRVjGzPWCtAM9iIFNuGtH3fV8sO/NppHiTN90a3teZOG9Fzf16GxwaxlWFr8Jg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 10:42:34.269288+00	00000000-0000-0000-0000-000000000000	2026-05-09 11:03:36.939976+00	\N
019e0c80-c602-79cf-a499-228bf7fcdf20	m3GB6zaKI1dHw4kZR3kbV2iq7JqVW7OgSevrEwjZqQe0nI0jff30BwrpirvL7bj6PV/OHIHKDGh+iX/vPvvlVg==	2026-05-16 11:30:26.433802+00	2026-05-09 13:16:14.909686+00	2026-05-09 13:17:14.909719+00	FeefxKnv3+VmeLsjKE/TxxArl3ZA6Y5FCWHpiqxIM18F/bqsBnnzi/Cl3iKBA/Zt46f86gi4vaF7SD4cKeIJlA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 11:30:26.434107+00	00000000-0000-0000-0000-000000000000	2026-05-09 13:16:15.409418+00	\N
019e0ce1-a64f-7c5d-9631-f94614445343	FeefxKnv3+VmeLsjKE/TxxArl3ZA6Y5FCWHpiqxIM18F/bqsBnnzi/Cl3iKBA/Zt46f86gi4vaF7SD4cKeIJlA==	2026-05-16 13:16:14.910557+00	2026-05-09 13:38:44.446317+00	2026-05-09 13:39:44.446317+00	CJ/YdnbgFSva3vzuzyECL2pirKFS/NWrCY9r4VNgOqsoZMhn4bcZzbwI/GqfyOfxqAUc/B6ZcPBM4s++ksaXQQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 13:16:15.408398+00	00000000-0000-0000-0000-000000000000	2026-05-09 13:38:44.447699+00	\N
019e0998-f9d3-75dd-834b-b93dc83f1e16	YZMjIVbpXIsp8uUlniulW1iziLMdEtZwxX5F/QeWRvk8z+T3yK55E0qJZn3ebhw/c4lYoPh1l9dsqizoztjPZA==	2026-05-15 21:58:00.91511+00	2026-05-10 09:39:09.996513+00	2026-05-10 09:40:09.996513+00	yrFheV3OrmSxSoZHq1L7D5+LKue5hXzgzImMSoK6gLyl2s9uKAlR2RQl1WcqRFd2Q2zqpG7Ze1fsU44mTP59yg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 21:58:00.915407+00	00000000-0000-0000-0000-000000000000	2026-05-10 09:39:09.997075+00	\N
019e0715-13de-7755-9b92-147077cdf554	+okEnRRcwB0wqbmZjrQonTMXSp2znIHAqdFdkusV9gPT7ZhXrDHw6cFbSrb56NhhGZomzxsoXi3QhsYEFtqUIQ==	2026-05-15 10:14:42.395865+00	2026-05-11 09:43:21.706747+00	2026-05-11 09:44:21.706786+00	sWblycODlwioagmRYr6XGhid9B4oS6UdsXKMltB8mnx5hogqpR8f8gWLZk6FYTWrDHqPMYkW6W/jtuhLei3PZw==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-08 10:14:42.398386+00	00000000-0000-0000-0000-000000000000	2026-05-11 09:43:22.21909+00	\N
019e0cf6-3c5f-7ef1-b2eb-574cfe634a64	CJ/YdnbgFSva3vzuzyECL2pirKFS/NWrCY9r4VNgOqsoZMhn4bcZzbwI/GqfyOfxqAUc/B6ZcPBM4s++ksaXQQ==	2026-05-16 13:38:44.446319+00	2026-05-09 14:11:11.125166+00	2026-05-09 14:12:11.125166+00	j92cRynPhHW+rFabPfWPnUQzoerrJXLTFjW/hHFxMDo7CC2PenxkdB2fuqFHm1BkH7GpRUruXcPtomzMK7RI4g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 13:38:44.447682+00	00000000-0000-0000-0000-000000000000	2026-05-09 14:11:11.125498+00	\N
019e0d13-f095-72ee-8ae6-5d0a1e706ed6	j92cRynPhHW+rFabPfWPnUQzoerrJXLTFjW/hHFxMDo7CC2PenxkdB2fuqFHm1BkH7GpRUruXcPtomzMK7RI4g==	2026-05-16 14:11:11.125169+00	2026-05-09 14:32:11.918525+00	2026-05-09 14:33:11.918525+00	pBhSxQvZo+tajo9AmdV/sF6o/Q+wrp4x/5HX/yKQVAY37TnMA0as1YNLYmp1etm3sFpK3C8FPJLSvWq+ckSKvg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 14:11:11.125481+00	00000000-0000-0000-0000-000000000000	2026-05-09 14:32:11.918838+00	\N
019e0d27-2d8e-70cc-a7e9-f989f189d946	pBhSxQvZo+tajo9AmdV/sF6o/Q+wrp4x/5HX/yKQVAY37TnMA0as1YNLYmp1etm3sFpK3C8FPJLSvWq+ckSKvg==	2026-05-16 14:32:11.918526+00	2026-05-09 14:53:36.858595+00	2026-05-09 14:54:36.858647+00	v0Z5yIvB+Z11rFikbjcX0kzWUOdA+08Um5qPc+LrccPN876UGC6I4lamkfxGpvJNHgPJDzDtPdQ+pQrprduk4Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 14:32:11.918822+00	00000000-0000-0000-0000-000000000000	2026-05-09 14:53:37.467986+00	\N
019e0d3a-cad3-7d7e-9774-38704832e13a	v0Z5yIvB+Z11rFikbjcX0kzWUOdA+08Um5qPc+LrccPN876UGC6I4lamkfxGpvJNHgPJDzDtPdQ+pQrprduk4Q==	2026-05-16 14:53:36.85958+00	2026-05-09 15:13:45.892009+00	2026-05-09 15:14:45.892009+00	56GGmEMh69CUshP8MvYdT4m5XwQsN6cg097zP3G1a+WItBGCMqaUtrEECWC5u45meqhVk89YVjS+bSe2OJUqRw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 14:53:37.46756+00	00000000-0000-0000-0000-000000000000	2026-05-09 15:13:45.89328+00	\N
019e0d5a-f1a8-78c6-8df5-a08efcc8c804	SeMnEypmx21HQPsDMLwAFP2uNE/gtNiHoZjhXRbgKC5EYA8R/+SU4p24Xhl6VhiA8J2rSYCjG2QBjJFwqRdk3g==	2026-05-16 15:28:44.456273+00	2026-05-09 15:49:35.019259+00	2026-05-09 15:50:35.019298+00	ZqHqxRY5NV/kkwrdshKgmKuRX5Fd8ZqCYrwny8mfOI9M4ZMs2xQXB929f7tCvkfWZdpJWs6JvUcWrVyB0UB6Ug==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-09 15:28:44.456723+00	00000000-0000-0000-0000-000000000000	2026-05-09 15:49:35.720332+00	\N
019e0d6e-0908-71a2-978e-51cf5bc9e882	ZqHqxRY5NV/kkwrdshKgmKuRX5Fd8ZqCYrwny8mfOI9M4ZMs2xQXB929f7tCvkfWZdpJWs6JvUcWrVyB0UB6Ug==	2026-05-16 15:49:35.020439+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-09 15:49:35.719849+00	00000000-0000-0000-0000-000000000000	2026-05-09 15:49:35.719849+00	\N
019e0d4d-3ba4-7756-b848-217fae9e9df8	56GGmEMh69CUshP8MvYdT4m5XwQsN6cg097zP3G1a+WItBGCMqaUtrEECWC5u45meqhVk89YVjS+bSe2OJUqRw==	2026-05-16 15:13:45.892012+00	2026-05-09 15:50:34.077724+00	2026-05-09 15:51:34.077724+00	7kdnwGn4eFz5nnLDdJr1dIQSCwc5mWd8I3UXff1ycj8MiWqFgcoQxBhJSHXcsfOXuO8H+3zISLIoI95WPnK2Cw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 15:13:45.893243+00	00000000-0000-0000-0000-000000000000	2026-05-09 15:50:34.079124+00	\N
019e0d6e-ed5e-7210-a49a-49253f3bc622	7kdnwGn4eFz5nnLDdJr1dIQSCwc5mWd8I3UXff1ycj8MiWqFgcoQxBhJSHXcsfOXuO8H+3zISLIoI95WPnK2Cw==	2026-05-16 15:50:34.077727+00	2026-05-09 19:02:26.69008+00	2026-05-09 19:03:26.69011+00	NxKE2SbULe+6c246xiPGkH+LjFh4CfNsw8g/F/FR8my+DSCbN3n3weTaWewaM5+B498b1AJmA5X3O1bcKcxlPg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 15:50:34.079106+00	00000000-0000-0000-0000-000000000000	2026-05-09 19:02:27.28128+00	\N
019e0e1e-9a70-77e8-b515-f894b3e1c7ed	NxKE2SbULe+6c246xiPGkH+LjFh4CfNsw8g/F/FR8my+DSCbN3n3weTaWewaM5+B498b1AJmA5X3O1bcKcxlPg==	2026-05-16 19:02:26.691019+00	2026-05-09 19:36:35.019185+00	2026-05-09 19:37:35.019219+00	R+GWc1+dGC6txbD5VBBXkNnTCB0JYvEss383axrJ3T921q3kpSU2yzmyHZ7AuMoVbO+qgcnLKCTnZE0/iUH2AQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 19:02:27.279871+00	00000000-0000-0000-0000-000000000000	2026-05-09 19:36:35.516115+00	\N
019e0e3d-dbb1-78c7-ad98-53d9fdbf8de8	R+GWc1+dGC6txbD5VBBXkNnTCB0JYvEss383axrJ3T921q3kpSU2yzmyHZ7AuMoVbO+qgcnLKCTnZE0/iUH2AQ==	2026-05-16 19:36:35.019946+00	2026-05-10 06:22:47.039393+00	2026-05-10 06:23:47.039424+00	d3WqfuQ4LOI1MZrBoxOV3pmLKzdKRF705Z6T73z1xAFRbHMZ1JGMeLl3BQBqT5GMgg4P6x7o6pvjAa+dGUko6w==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 19:36:35.515341+00	00000000-0000-0000-0000-000000000000	2026-05-10 06:22:47.534416+00	\N
019e108d-788e-7635-a089-935fade4618a	d3WqfuQ4LOI1MZrBoxOV3pmLKzdKRF705Z6T73z1xAFRbHMZ1JGMeLl3BQBqT5GMgg4P6x7o6pvjAa+dGUko6w==	2026-05-17 06:22:47.040184+00	2026-05-10 06:25:21.452814+00	2026-05-10 06:26:21.452865+00	VIq0iAXhFDj6XkjFN/+mLVWKW1eIhYBVEZOpn27OUiHOewsUfAhQICTDBla6xhmWY77tuNSP/qtIucQmKtlp+g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 06:22:47.533818+00	00000000-0000-0000-0000-000000000000	2026-05-10 06:25:21.520345+00	\N
019e108f-d267-7ed4-a212-f74214a10109	VIq0iAXhFDj6XkjFN/+mLVWKW1eIhYBVEZOpn27OUiHOewsUfAhQICTDBla6xhmWY77tuNSP/qtIucQmKtlp+g==	2026-05-17 06:25:21.453547+00	2026-05-10 06:49:21.571563+00	2026-05-10 06:50:21.571626+00	xUpd5/jadX2dn9g0Pr0Ksu8a7o2GwosM27fjd1xIq9Qc17NEWVgVvCs402sbqhWmoc0gk4GlaM0GgQn1wXtkxw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 06:25:21.519471+00	00000000-0000-0000-0000-000000000000	2026-05-10 06:49:21.637614+00	\N
019e10a5-cbda-7ef0-8508-8d9290283cb1	xUpd5/jadX2dn9g0Pr0Ksu8a7o2GwosM27fjd1xIq9Qc17NEWVgVvCs402sbqhWmoc0gk4GlaM0GgQn1wXtkxw==	2026-05-17 06:49:21.572522+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 06:49:21.63689+00	00000000-0000-0000-0000-000000000000	2026-05-10 06:49:21.63689+00	\N
019e110a-6ec1-77ed-965c-cb8a4597743e	EsYSoG4FOPM4TUQTujugljAJsmf3whj9fD4E4aGjN0FeIbtZ6rZvryw6ynlOpklee1/UhUmvoGnSWrFtDb4FbA==	2026-05-17 08:39:16.893346+00	2026-05-10 08:59:56.324828+00	2026-05-10 09:00:56.324888+00	i+Vj+ElbT1Es4JSNRJ7oBRT9UY5S7hMFQrh3Ma1yx3eqzN9m/5+nBzofyicqazP7xjRmb5dz9Qh8CVVD9/2h3Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 08:39:16.957238+00	00000000-0000-0000-0000-000000000000	2026-05-10 08:59:56.356453+00	\N
019e111d-583d-7fb7-912f-13c966ef3af6	i+Vj+ElbT1Es4JSNRJ7oBRT9UY5S7hMFQrh3Ma1yx3eqzN9m/5+nBzofyicqazP7xjRmb5dz9Qh8CVVD9/2h3Q==	2026-05-17 08:59:56.325729+00	2026-05-10 09:20:39.870745+00	2026-05-10 09:21:39.870745+00	xywP+Uhz/oq/ThpSBkJiLIJqLBOY6/uJstaq5q5Yh5BaozGTaqfF7j/OD0N3YnkvbQnWSZXpWiYQ3VRgOuqcwg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 08:59:56.356271+00	00000000-0000-0000-0000-000000000000	2026-05-10 09:20:39.871276+00	\N
019e1130-51bf-7e16-b297-316cf7eb6c0b	xywP+Uhz/oq/ThpSBkJiLIJqLBOY6/uJstaq5q5Yh5BaozGTaqfF7j/OD0N3YnkvbQnWSZXpWiYQ3VRgOuqcwg==	2026-05-17 09:20:39.870749+00	2026-05-10 09:44:24.966936+00	2026-05-10 09:45:24.966936+00	jBkAEPAREiDIDfa6U6Ry+Dxz1yOU/rbUUwwRANEbbaIRKFI7OSbqwcBoFfJ7/Pqa/o2GP9rXocQrNt4MRZKkJQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 09:20:39.871261+00	00000000-0000-0000-0000-000000000000	2026-05-10 09:44:24.967195+00	\N
019e1146-1087-750a-89f3-d0c6ab6ab1ec	jBkAEPAREiDIDfa6U6Ry+Dxz1yOU/rbUUwwRANEbbaIRKFI7OSbqwcBoFfJ7/Pqa/o2GP9rXocQrNt4MRZKkJQ==	2026-05-17 09:44:24.966939+00	2026-05-10 10:15:04.972381+00	2026-05-10 10:16:04.972382+00	DP90rnF0z8B6auoNUVqVD5eajnz76Tv9Q/BGvV6fiKfsIoslcQDf903AOUMU6oiEum/GzgvQ5lN6E74fH0weuQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 09:44:24.967181+00	00000000-0000-0000-0000-000000000000	2026-05-10 10:15:04.972806+00	\N
019e1162-240c-7619-b564-96855ce9c8ed	DP90rnF0z8B6auoNUVqVD5eajnz76Tv9Q/BGvV6fiKfsIoslcQDf903AOUMU6oiEum/GzgvQ5lN6E74fH0weuQ==	2026-05-17 10:15:04.972386+00	2026-05-10 10:38:07.402738+00	2026-05-10 10:39:07.40281+00	yQq59odiHVCf/G91ny8+SvbE4Vlb/lyB2UPZWvHc+IIt3SsBSCZ19kg2juabXBMKKNO4N+FKSy6EJVvLPbrEMg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 10:15:04.972777+00	00000000-0000-0000-0000-000000000000	2026-05-10 10:38:07.471235+00	\N
019e1177-3c63-7e3a-a338-9633c234d2cc	yQq59odiHVCf/G91ny8+SvbE4Vlb/lyB2UPZWvHc+IIt3SsBSCZ19kg2juabXBMKKNO4N+FKSy6EJVvLPbrEMg==	2026-05-17 10:38:07.403842+00	2026-05-10 10:58:13.555086+00	2026-05-10 10:59:13.555086+00	7ae3XOvsJvUTGFefmmHT7XKy+GcyOKHH6UAPID9Yc+6FE2wWs2QCFHze+TSlMNDevFEJ2fbZY11nLp5QHwVT9g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 10:38:07.470637+00	00000000-0000-0000-0000-000000000000	2026-05-10 10:58:13.555447+00	\N
019e1141-422c-7376-91f0-59186d7ee577	yrFheV3OrmSxSoZHq1L7D5+LKue5hXzgzImMSoK6gLyl2s9uKAlR2RQl1WcqRFd2Q2zqpG7Ze1fsU44mTP59yg==	2026-05-17 09:39:09.996517+00	2026-05-10 11:08:58.591191+00	2026-05-10 11:09:58.591191+00	72DkjkL5Vh+ElAJCZwjZz6wZf/i7fJW4sn6UruXeum4JLKI82j7uxAWG9w8S0WFsAf7cjQUthl/GIL7JAsKnNw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 09:39:09.996911+00	00000000-0000-0000-0000-000000000000	2026-05-10 11:08:58.591697+00	\N
019e1189-a3b3-74b8-8248-49156171fe1e	7ae3XOvsJvUTGFefmmHT7XKy+GcyOKHH6UAPID9Yc+6FE2wWs2QCFHze+TSlMNDevFEJ2fbZY11nLp5QHwVT9g==	2026-05-17 10:58:13.555089+00	2026-05-10 11:28:26.960942+00	2026-05-10 11:29:26.960942+00	a4EdCi//6TXPYk254+gHKgw5q7yuSbureRWYGqoOWo16kV5r8mEDeXKd7Ykx7464v8VIwy7OGJYY3xEzd5li6g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 10:58:13.555433+00	00000000-0000-0000-0000-000000000000	2026-05-10 11:28:26.961256+00	\N
019e1193-7b5f-7970-8397-c2ba232ab206	72DkjkL5Vh+ElAJCZwjZz6wZf/i7fJW4sn6UruXeum4JLKI82j7uxAWG9w8S0WFsAf7cjQUthl/GIL7JAsKnNw==	2026-05-17 11:08:58.591195+00	2026-05-10 11:29:53.540718+00	2026-05-10 11:30:53.540718+00	5hFvc3L9+4slxgFpRwpyWK06ZmZk0FKkzcKnQ+aqDhnb1MYrje7jNwQ/hNzlZStapOJ8k9WOKtovHHT5WNupMg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 11:08:58.591682+00	00000000-0000-0000-0000-000000000000	2026-05-10 11:29:53.540937+00	\N
019e11a5-4f51-7243-bd7d-01e0b6db7298	a4EdCi//6TXPYk254+gHKgw5q7yuSbureRWYGqoOWo16kV5r8mEDeXKd7Ykx7464v8VIwy7OGJYY3xEzd5li6g==	2026-05-17 11:28:26.960945+00	2026-05-10 11:49:56.043492+00	2026-05-10 11:50:56.043492+00	q/07QPu2Srty15wwceyZwAOT9wJ3+WyULGb4J3waJZXDQ+b5IpRbIbf0gIIM+1u1OFppDildXx4gWEwB5yGNow==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 11:28:26.961237+00	00000000-0000-0000-0000-000000000000	2026-05-10 11:49:56.043854+00	\N
019e11a6-a184-73a3-844c-dc7987f3ea2f	5hFvc3L9+4slxgFpRwpyWK06ZmZk0FKkzcKnQ+aqDhnb1MYrje7jNwQ/hNzlZStapOJ8k9WOKtovHHT5WNupMg==	2026-05-17 11:29:53.540721+00	2026-05-10 11:50:36.31544+00	2026-05-10 11:51:36.315441+00	ukLy8ugTegUhIOF/utTIwRJ47xTr0LGpT6GCYUb2T3O/LRFmABP2gmvMbTgVknDfzta+izZX3KDjxwgQixJxoA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 11:29:53.540914+00	00000000-0000-0000-0000-000000000000	2026-05-10 11:50:36.315755+00	\N
019e11b9-981b-7911-a7f4-13547f198308	ukLy8ugTegUhIOF/utTIwRJ47xTr0LGpT6GCYUb2T3O/LRFmABP2gmvMbTgVknDfzta+izZX3KDjxwgQixJxoA==	2026-05-17 11:50:36.315445+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 11:50:36.315723+00	00000000-0000-0000-0000-000000000000	2026-05-10 11:50:36.315723+00	\N
019e11b8-facb-7ea1-a2e4-1d39159ae84e	q/07QPu2Srty15wwceyZwAOT9wJ3+WyULGb4J3waJZXDQ+b5IpRbIbf0gIIM+1u1OFppDildXx4gWEwB5yGNow==	2026-05-17 11:49:56.043495+00	2026-05-10 12:10:24.45402+00	2026-05-10 12:11:24.454075+00	tdXRMLrgEc5VlkiyKow+WHHw/fppDQFIlbs9P4C3d78VNRYwEJ5XIZ13ENjEi+9SBtkS/prlfJ+yzxXGYJQxYA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 11:49:56.043841+00	00000000-0000-0000-0000-000000000000	2026-05-10 12:10:24.517279+00	\N
019e11cb-b979-73f9-87c5-a7624dbba36b	tdXRMLrgEc5VlkiyKow+WHHw/fppDQFIlbs9P4C3d78VNRYwEJ5XIZ13ENjEi+9SBtkS/prlfJ+yzxXGYJQxYA==	2026-05-17 12:10:24.454892+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 12:10:24.516512+00	00000000-0000-0000-0000-000000000000	2026-05-10 12:10:24.516512+00	\N
019e11cf-3a8e-7036-99d5-bdcccd898e67	itmG85I23jvYYRAb/n9ODKZFN1KodiG/NfM91kIWo9Jafrf/hy20fYoLLliCtha0wNjh6xivYmS3Dy39s1p8DA==	2026-05-17 12:14:14.119723+00	2026-05-10 12:35:45.937806+00	2026-05-10 12:36:45.937867+00	N1cjuSkDi3TX0EwCeuKgv4yhwoKmiaYL43p/pkOb5Hj5PAFo1LDhiAaiWcvHnzy6lDGLWgLgpJn8jIm6Iood8w==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 12:14:14.18554+00	00000000-0000-0000-0000-000000000000	2026-05-10 12:35:45.997725+00	\N
019e11e2-f0c4-721b-a66a-924e01a66219	N1cjuSkDi3TX0EwCeuKgv4yhwoKmiaYL43p/pkOb5Hj5PAFo1LDhiAaiWcvHnzy6lDGLWgLgpJn8jIm6Iood8w==	2026-05-17 12:35:45.938716+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 12:35:45.99708+00	00000000-0000-0000-0000-000000000000	2026-05-10 12:35:45.99708+00	\N
019e11e5-667c-71f9-9a4a-138de6d4ea87	VJUgNXqoyhd5t4+k+oWUoT4Np/bL4MfFO8bLr4UkCNM8g/reek3RYq3unmpBCkxIdnkT9UQGJ6G6z+rROz3vbA==	2026-05-17 12:38:27.160017+00	2026-05-10 12:58:34.729325+00	2026-05-10 12:59:34.729366+00	ySD9Lo9E8Q8l2RvMLsFW8giA0z0ikcqnPpghwZFWR18Q5iTNCLiH+zQRte+nm487r6ElUCzWN6LC48sV5qUoJg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 12:38:27.223843+00	00000000-0000-0000-0000-000000000000	2026-05-10 12:58:34.76082+00	\N
019e11f7-d382-78cc-888d-4d5d1ea90508	ySD9Lo9E8Q8l2RvMLsFW8giA0z0ikcqnPpghwZFWR18Q5iTNCLiH+zQRte+nm487r6ElUCzWN6LC48sV5qUoJg==	2026-05-17 12:58:34.730024+00	2026-05-10 13:22:22.105814+00	2026-05-10 13:23:22.105869+00	iDtCBJ0sEuhgVOcXmFTaMvPeQEw6KwGRHJRD8BxFBhw0gQ0cS3ByO0zWsT6EzYjX/zFKrUqammJmj0DIw2PahQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 12:58:34.760704+00	00000000-0000-0000-0000-000000000000	2026-05-10 13:22:22.155219+00	\N
019e120d-9b43-7feb-8311-08a042a72096	iDtCBJ0sEuhgVOcXmFTaMvPeQEw6KwGRHJRD8BxFBhw0gQ0cS3ByO0zWsT6EzYjX/zFKrUqammJmj0DIw2PahQ==	2026-05-17 13:22:22.106599+00	2026-05-10 13:44:07.862339+00	2026-05-10 13:45:07.862339+00	bwHLvLvsx2EFQgyESIsSUT05UHzv6j43OcWRVv4XXyvxaX2S8zptsRfRZcdXvcs1VSCelRnyXI+dwrDHnNxElw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 13:22:22.154919+00	00000000-0000-0000-0000-000000000000	2026-05-10 13:44:07.863717+00	\N
019e1221-87b7-7fd1-8c47-55705ffd9bb2	bwHLvLvsx2EFQgyESIsSUT05UHzv6j43OcWRVv4XXyvxaX2S8zptsRfRZcdXvcs1VSCelRnyXI+dwrDHnNxElw==	2026-05-17 13:44:07.862342+00	2026-05-10 14:06:16.834228+00	2026-05-10 14:07:16.834228+00	wZ2GadLCcb4iUcVu1640Z0BePY4bNDEOsJVizk9RMNG5jnRezi45vl5Gv9Ar78ksi2KPQVKP6bSqg1uW9/7F3w==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 13:44:07.863701+00	00000000-0000-0000-0000-000000000000	2026-05-10 14:06:16.834689+00	\N
019e1235-cf02-7b5c-8d09-4f62208411fd	wZ2GadLCcb4iUcVu1640Z0BePY4bNDEOsJVizk9RMNG5jnRezi45vl5Gv9Ar78ksi2KPQVKP6bSqg1uW9/7F3w==	2026-05-17 14:06:16.834234+00	2026-05-10 14:29:44.269483+00	2026-05-10 14:30:44.269483+00	eK8ZDM0AH2GdD8ITbaVFDfaalnAzC1c6bBjnc0HhDANIYxKwGb4wOP6s6315XINqXP2rWxGnk1nSzDS1KP9WMw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 14:06:16.834672+00	00000000-0000-0000-0000-000000000000	2026-05-10 14:29:44.269855+00	\N
019e124b-48cd-729b-b7f4-beba52fc9110	eK8ZDM0AH2GdD8ITbaVFDfaalnAzC1c6bBjnc0HhDANIYxKwGb4wOP6s6315XINqXP2rWxGnk1nSzDS1KP9WMw==	2026-05-17 14:29:44.269486+00	2026-05-10 22:17:34.715955+00	2026-05-10 22:18:34.716006+00	ozNd0MYy6aWJb9/N5e/6EQFJqJvaJ2MMPEl6mbxqgkDMvikMuhK3LPkQR10f6jl7DbXAR6K5wY/G2daWr2blBQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 14:29:44.269837+00	00000000-0000-0000-0000-000000000000	2026-05-10 22:17:34.769242+00	\N
019e13f8-7d3e-7fee-822d-cafe3ab63549	wWl22ER1Db8TAsmw1Dt1IYL1y3vie7ApB+CogpV1e3oC7BVdfuz+uN9lhylgRz54iUJYt29SSx/hqD+tsj1jWw==	2026-05-17 22:18:32.637502+00	2026-05-10 22:42:02.639131+00	2026-05-10 22:43:02.639134+00	8BsHUsOTtT7JoBSNa2/NTq/FqWXfUe6koN7xeiGxIn2meWntKVw/7rXOWG1jV4dNESoLrwXeSPLdUtFBSLJ32Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 22:18:32.638534+00	00000000-0000-0000-0000-000000000000	2026-05-10 22:42:02.639888+00	\N
019e140e-010f-7f7e-a8a4-99b371bb2806	8BsHUsOTtT7JoBSNa2/NTq/FqWXfUe6koN7xeiGxIn2meWntKVw/7rXOWG1jV4dNESoLrwXeSPLdUtFBSLJ32Q==	2026-05-17 22:42:02.639137+00	2026-05-10 23:04:33.209649+00	2026-05-10 23:05:33.20969+00	PXqC4qNh4nF+P2ybd6asXyyulc60PjRNiAcyrdaOIDtHDy8YpzQAkSf84mccSavWf1EHOFpKa5em2TieDt1gjQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 22:42:02.639867+00	00000000-0000-0000-0000-000000000000	2026-05-10 23:04:33.71281+00	\N
019e1422-9e51-79e3-91b8-c5741e257943	PXqC4qNh4nF+P2ybd6asXyyulc60PjRNiAcyrdaOIDtHDy8YpzQAkSf84mccSavWf1EHOFpKa5em2TieDt1gjQ==	2026-05-17 23:04:33.210638+00	2026-05-10 23:13:59.131766+00	2026-05-10 23:14:59.131827+00	lKP3QVuSAUylfhBpvO6l2l9bqdsy+33zV4YJoZpt38t/8x+2MKmqGBZP3G6aIp+7GFLrt1HJaqCADboAy8Wabg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 23:04:33.712097+00	00000000-0000-0000-0000-000000000000	2026-05-10 23:13:59.191598+00	\N
019e142b-3f8e-7e49-83a9-5d904c047632	lKP3QVuSAUylfhBpvO6l2l9bqdsy+33zV4YJoZpt38t/8x+2MKmqGBZP3G6aIp+7GFLrt1HJaqCADboAy8Wabg==	2026-05-17 23:13:59.132654+00	2026-05-10 23:30:04.911155+00	2026-05-10 23:31:04.91119+00	oN1TA3A3/5D5oZjPIk+3HO6zFPZ9Mcrz1lb+w2FMGnakBlLhRFqWZqxSMFwG37puiTDcNMm1c6TD7CdX1tqd/w==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 23:13:59.190886+00	00000000-0000-0000-0000-000000000000	2026-05-10 23:30:05.323309+00	\N
019e0c5e-0759-7b14-90ab-51af5058a5ed	nM7fBWn99nOckHfhp231WaiXq1Myl8HTYBzofcvxnBjokhEcLsk/KqsvgCrZD6GVRddLwHIUZffdxapIw8Yt5Q==	2026-05-16 10:52:29.001588+00	2026-05-10 23:33:35.725016+00	2026-05-10 23:34:35.72505+00	AJUYU9QoxvPQ1/Fa9IXBOeiziUQx2n/1T+3hb/W3RJ86iQLLno4fpNKyFxlRtmPRxro8LCm3aTcaOhAnqBPQOw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 10:52:29.410464+00	00000000-0000-0000-0000-000000000000	2026-05-10 23:33:36.228756+00	\N
019e1439-fd81-7654-838d-2f31020c0db1	oN1TA3A3/5D5oZjPIk+3HO6zFPZ9Mcrz1lb+w2FMGnakBlLhRFqWZqxSMFwG37puiTDcNMm1c6TD7CdX1tqd/w==	2026-05-17 23:30:04.912106+00	2026-05-11 02:59:40.605902+00	2026-05-11 03:00:40.605945+00	bZbulWnztGqVNSWtym1AevZD7SNU+6qeY7IFo2aykSMW1MIsYhK9gYHZFfW5NiFflI875jyab28mqyeJfaxLjQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 23:30:05.322782+00	00000000-0000-0000-0000-000000000000	2026-05-11 02:59:41.109143+00	\N
019e14f9-e153-779e-abaa-1f66bad6efdf	bZbulWnztGqVNSWtym1AevZD7SNU+6qeY7IFo2aykSMW1MIsYhK9gYHZFfW5NiFflI875jyab28mqyeJfaxLjQ==	2026-05-18 02:59:40.607175+00	2026-05-11 03:32:13.268998+00	2026-05-11 03:33:13.269023+00	+5WtK/cIAfrvKmo/6Mgbsnvcb0qQTYa5qKom750EjZjveKLYtMy8+LEGlTZe7QRPPza9rKqa+U3SQd4U1PJgyg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 02:59:41.108503+00	00000000-0000-0000-0000-000000000000	2026-05-11 03:32:13.765592+00	\N
019e1517-ace5-77dc-820e-c08c0f63fb72	+5WtK/cIAfrvKmo/6Mgbsnvcb0qQTYa5qKom750EjZjveKLYtMy8+LEGlTZe7QRPPza9rKqa+U3SQd4U1PJgyg==	2026-05-18 03:32:13.269799+00	2026-05-11 03:33:19.39167+00	2026-05-11 03:34:19.391731+00	3iG1PGhspUg0GDlu6OvNc1cRv7AWz/Wytuv9S4uoR3YDu96F2GGoOtY6K5J2qYwE5I50iZiF1AL0PaEaCyI2JA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 03:32:13.765098+00	00000000-0000-0000-0000-000000000000	2026-05-11 03:33:19.448162+00	\N
019e166f-b1c8-7672-a7c8-1da3ba1a3f54	jhN+r2/m51q4Dk26isfA7WtiLxQ80aB5651wPaJd+Dx40Fjhohx5rg6/LPCDG5QWG8mHW5uxhBXU70gp+L30uQ==	2026-05-18 09:47:59.215513+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 09:47:59.304595+00	00000000-0000-0000-0000-000000000000	2026-05-11 09:47:59.304595+00	\N
019e1518-adce-78e5-9eff-a6bb54ac936e	3iG1PGhspUg0GDlu6OvNc1cRv7AWz/Wytuv9S4uoR3YDu96F2GGoOtY6K5J2qYwE5I50iZiF1AL0PaEaCyI2JA==	2026-05-18 03:33:19.392597+00	2026-05-11 17:31:41.052582+00	2026-05-11 17:32:41.05263+00	XQHFk7ejJbth0oMvyk3VPh1Pb3EoYUoqCCWecd40Y9jGgSwF7eQBFdmFI9Tq0rMNz9r9Ud2ScYpes9dKViU7yQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 03:33:19.447497+00	00000000-0000-0000-0000-000000000000	2026-05-11 17:31:41.110084+00	\N
019e1818-38ac-7212-8672-7f91e637cba1	XQHFk7ejJbth0oMvyk3VPh1Pb3EoYUoqCCWecd40Y9jGgSwF7eQBFdmFI9Tq0rMNz9r9Ud2ScYpes9dKViU7yQ==	2026-05-18 17:31:41.053344+00	2026-05-11 17:51:46.228549+00	2026-05-11 17:52:46.228549+00	KnHz5i2S2qXEy4LzvUV4IUSOUJ5VcvPJTx7chSofXiKhaRM3gcbUVjFQ+4g5Q434P9YeavInS739pGMF4nbuGQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 17:31:41.109477+00	00000000-0000-0000-0000-000000000000	2026-05-11 17:51:46.229993+00	\N
019e182a-9c35-7cc9-8319-d54971f5763c	KnHz5i2S2qXEy4LzvUV4IUSOUJ5VcvPJTx7chSofXiKhaRM3gcbUVjFQ+4g5Q434P9YeavInS739pGMF4nbuGQ==	2026-05-18 17:51:46.228553+00	2026-05-11 18:11:47.432726+00	2026-05-11 18:12:47.432726+00	a4on19kPLaLONC5gEKX8FT9rTz6oz5AUl8qhH/UjrUbsW94kKarAjead8emMTMOcG/REh3+nl4DfM6Mh5sUkwg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 17:51:46.229966+00	00000000-0000-0000-0000-000000000000	2026-05-11 18:11:47.433449+00	\N
019e143d-3558-7a0b-afe0-906e3f432f5e	AJUYU9QoxvPQ1/Fa9IXBOeiziUQx2n/1T+3hb/W3RJ86iQLLno4fpNKyFxlRtmPRxro8LCm3aTcaOhAnqBPQOw==	2026-05-17 23:33:35.725889+00	2026-05-11 18:22:39.155629+00	2026-05-11 18:23:39.155687+00	qi7Nl1YZpC265b/Tfz/xKswDmVGWNeoRKS+irK/KMZi9c8tLFg1u/aXsjGbBdWwORKOcxh8ZM2vUw5OP9zAjhw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 23:33:36.227925+00	00000000-0000-0000-0000-000000000000	2026-05-11 18:22:39.757408+00	\N
019e1846-e47f-77f7-aeb4-8d95606454eb	qi7Nl1YZpC265b/Tfz/xKswDmVGWNeoRKS+irK/KMZi9c8tLFg1u/aXsjGbBdWwORKOcxh8ZM2vUw5OP9zAjhw==	2026-05-18 18:22:39.156717+00	2026-05-12 03:09:23.948573+00	2026-05-12 03:10:23.9486+00	QgnbdaOZHjBX1pTmZVLQTArwkYBpUmhME+iNa1tWpZw//bqiiQeLQYW/B8JYSu0tv8omGRekCMUQ2BTS7O3BJA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 18:22:39.756799+00	00000000-0000-0000-0000-000000000000	2026-05-12 03:09:24.44864+00	\N
019e1a29-2402-7215-a229-0ddbf14c1aab	QgnbdaOZHjBX1pTmZVLQTArwkYBpUmhME+iNa1tWpZw//bqiiQeLQYW/B8JYSu0tv8omGRekCMUQ2BTS7O3BJA==	2026-05-19 03:09:23.949444+00	2026-05-16 05:22:49.344956+00	2026-05-16 05:23:49.345019+00	MAiM8gunuOFyc0LQlJU289eig5xmU756RAB4ZP0gu57QpH+v6b79UI/0GC1f/4DneTgOEqO3q64OCyHhD0FEmw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-12 03:09:24.448109+00	00000000-0000-0000-0000-000000000000	2026-05-16 05:22:49.846675+00	\N
019e183c-f069-711f-b402-104cb0f994a5	a4on19kPLaLONC5gEKX8FT9rTz6oz5AUl8qhH/UjrUbsW94kKarAjead8emMTMOcG/REh3+nl4DfM6Mh5sUkwg==	2026-05-18 18:11:47.432729+00	2026-05-16 07:40:54.689057+00	2026-05-16 07:41:54.689097+00	0JqYIfog9V/bEuWA9wZZLKQkdWRm0MPXMKtBy2hzmwNuLsEdg2fWPWUGs34GXiWTfv1ZSOl8hPWDnQ37z+iN/g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 18:11:47.433428+00	00000000-0000-0000-0000-000000000000	2026-05-16 07:40:54.744716+00	\N
019e2fbb-264e-7ad2-93e2-564ac10e9943	0JqYIfog9V/bEuWA9wZZLKQkdWRm0MPXMKtBy2hzmwNuLsEdg2fWPWUGs34GXiWTfv1ZSOl8hPWDnQ37z+iN/g==	2026-05-23 07:40:54.689755+00	2026-05-16 08:01:09.440936+00	2026-05-16 08:02:09.441077+00	5IxHr5nteYLKXJXQuFpF0QKP9EO4MsABBgvDhXBZblS1Q/fIIyY93vqI3IRWTjSYx7Z69Nor07u5p5cy+Dx1NQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 07:40:54.744044+00	00000000-0000-0000-0000-000000000000	2026-05-16 08:01:09.574057+00	\N
019e2fcd-afb8-7760-abc2-a39a35579af3	5IxHr5nteYLKXJXQuFpF0QKP9EO4MsABBgvDhXBZblS1Q/fIIyY93vqI3IRWTjSYx7Z69Nor07u5p5cy+Dx1NQ==	2026-05-23 08:01:09.444672+00	2026-05-16 08:23:18.156808+00	2026-05-16 08:24:18.156808+00	f7gSZ8kEnjG/FnQEP3iKlkdld7dO5rJImr/OSfLQDxuL7F0k35gPBgAAt6WXJvuu8jeNBNV+zvJNJ0C+w28GJA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 08:01:09.573511+00	00000000-0000-0000-0000-000000000000	2026-05-16 08:23:18.157988+00	\N
019e2fe2-60ed-71b1-a28d-aff8cd950428	6mGpE3yRFzQE1RvYQ41PEF6SMjWPa7rALzidIlyprFa5jxGkDyjOIaC9tzwjF+TzxjRKopL8A/Fr8OPcmXxi+g==	2026-05-23 08:23:45.644922+00	2026-05-16 11:29:39.918205+00	2026-05-16 11:30:39.918277+00	EohONeJvsZzWkFCCDOk4JhVwb60WqZxuLOGEVrGOpFzSf/m9HgCDyK8kF1GsYTrUraUFt+idFxNd4gwpM90fpA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 08:23:45.645418+00	00000000-0000-0000-0000-000000000000	2026-05-16 11:29:39.975042+00	\N
019e308c-947e-76f1-b262-250bd0c2e594	EohONeJvsZzWkFCCDOk4JhVwb60WqZxuLOGEVrGOpFzSf/m9HgCDyK8kF1GsYTrUraUFt+idFxNd4gwpM90fpA==	2026-05-23 11:29:39.919085+00	2026-05-16 11:49:43.124561+00	2026-05-16 11:50:43.124562+00	LlI14PgLOKkfLlTrOWlZz04Mzue4l5SRczWhQX/XugWnBfKH2c1F1h1L6B/AxM8eOY2WLbn6D5+5WlAxR4qoZQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:29:39.974719+00	00000000-0000-0000-0000-000000000000	2026-05-16 11:49:43.124838+00	\N
019e309e-f054-7fbd-8b2b-7374b588df5c	LlI14PgLOKkfLlTrOWlZz04Mzue4l5SRczWhQX/XugWnBfKH2c1F1h1L6B/AxM8eOY2WLbn6D5+5WlAxR4qoZQ==	2026-05-23 11:49:43.124564+00	2026-05-16 12:33:13.211082+00	2026-05-16 12:34:13.21115+00	CY11gY3Nq4i/tTBUADvuIXov9eydIqVIbakYqj4KBni1/F8hrO1+R3FZGVSbNxCdzXkte3PZ4xlsYFsTWoSECQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:49:43.124825+00	00000000-0000-0000-0000-000000000000	2026-05-16 12:33:13.267772+00	\N
019e2f41-e67b-7ac3-bac2-1e81ce28c9d3	3cIrpOJNQn2DREOcIJYCh9y7VS+e5dmSPe4pNg/v+UwIV72Qo8cgrSdwyRsjiNR/J2Eum9+V8rCsgs5Hgx7pTw==	2026-05-23 05:28:28.539538+00	2026-05-16 12:37:12.870905+00	2026-05-16 12:38:12.870935+00	exzB99a15lXBZ6rbMfwBPQ0u9jOlPSIGp4kR6bjOJgq+3ya7um+r6PAnmVVHxKWczOaItW8RDV15YcFBJP1rlQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 05:28:28.539944+00	00000000-0000-0000-0000-000000000000	2026-05-16 12:37:13.372237+00	\N
019e30ca-6dba-7a07-a129-bd1b78ff9c5b	exzB99a15lXBZ6rbMfwBPQ0u9jOlPSIGp4kR6bjOJgq+3ya7um+r6PAnmVVHxKWczOaItW8RDV15YcFBJP1rlQ==	2026-05-23 12:37:12.871816+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 12:37:13.371645+00	00000000-0000-0000-0000-000000000000	2026-05-16 12:37:13.371645+00	\N
019e30c6-c42a-7a56-8c91-f0f4844b0d74	CY11gY3Nq4i/tTBUADvuIXov9eydIqVIbakYqj4KBni1/F8hrO1+R3FZGVSbNxCdzXkte3PZ4xlsYFsTWoSECQ==	2026-05-23 12:33:13.212349+00	2026-05-16 12:48:53.592536+00	2026-05-16 12:49:53.592536+00	vFVgmOobOR0D4is1RaxZ3zOzzaBrZGV1w8ZBvlFnYaGD8oHf9vCXn1oQDuVMmOBZ/73wp4atlezls9CpLkZ6Lw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 12:33:13.267077+00	00000000-0000-0000-0000-000000000000	2026-05-16 12:48:53.593952+00	\N
019e30d5-1d59-751d-bc59-4f9c60abd0ac	vFVgmOobOR0D4is1RaxZ3zOzzaBrZGV1w8ZBvlFnYaGD8oHf9vCXn1oQDuVMmOBZ/73wp4atlezls9CpLkZ6Lw==	2026-05-23 12:48:53.592538+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 12:48:53.59393+00	00000000-0000-0000-0000-000000000000	2026-05-16 12:48:53.59393+00	\N
019e30f4-ffa4-7d0c-8490-f2fdde32b687	9TOjGolDSrEgiXNNKMP+s/2b8OiUOBKWYUpoAPphHqzFhC8cupRSFi5hsTXwU+J1teBID999iiOzRZJc9C7PAg==	2026-05-23 13:23:42.749428+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 13:23:43.346058+00	00000000-0000-0000-0000-000000000000	2026-05-16 13:23:43.346058+00	\N
\.


--
-- Data for Name: SaaSConfigurations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SaaSConfigurations" ("Id", "PlatformName", "BillingEmail", "TaxPercentage", "GracePeriodDays", "Currency", "BillingAddress", "SupportPhone", "SupportEmail", "IsMaintenanceMode", "TermsUrl", "PrivacyUrl", "MaintenanceStartTime", "MaintenanceEndTime", "MonthlyRevenueTarget", "SubscriptionTarget", "UptimeThreshold", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d	GymForge	admin@gymforge.com	18.00	7	INR	\N	\N	\N	f	\N	\N	\N	\N	100000.00	10	99.90	2026-04-25 00:00:00+00	00000000-0000-0000-0000-000000000000	2026-04-29 18:38:15.965907+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
\.


--
-- Data for Name: SaaSPaymentTransactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SaaSPaymentTransactions" ("Id", "GymId", "SubscriptionId", "Amount", "Currency", "Status", "GatewayTransactionId", "GatewayResponse", "FailureReason", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
9b6ff51c-62f7-4bac-8480-067669ec4b16	472d8778-9a41-490d-aba9-3ccb02ab3ff3	0d55f94f-8e0c-4d5b-89bb-2e76f557867c	499.00	INR	Success	order_SjPS2w8C0PL7cP	pay_SjPSClTJS2LbBR	\N	2026-04-29 18:36:02.461334+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:36:26.868469+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
\.


--
-- Data for Name: SaleTransactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SaleTransactions" ("Id", "MemberId", "InventoryItemId", "Quantity", "UnitPrice", "TotalAmount", "PaymentMethod", "TransactionDate", "GymId", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
59be43cf-701b-4f8e-ad7d-6df0b1712cd7	019e003d-ce36-77b0-9a77-a3c7d7c3caee	019e110c-3ee5-7de4-aba6-db25fbd61a54	1	2499.00	2499.00	Cash	2026-05-10 14:06:17.324231+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-10 14:06:17.588612+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 14:06:17.588612+00	019dda81-85f0-7db5-bb97-8eb9853f4687
f4284750-f4bf-4acd-b918-b65564b94cdd	019dfe95-73ad-70b5-a585-ee4e4653d314	019e1417-3918-79f4-9b47-780d882bcb00	1	799.00	799.00	Card	2026-05-10 22:55:00.225969+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-10 22:55:00.456311+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 22:55:00.456311+00	019dda81-85f0-7db5-bb97-8eb9853f4687
9fb70ba7-dff7-4b8b-baa7-1471b74b3748	019dfe95-73ad-70b5-a585-ee4e4653d314	019e1417-3918-79f4-9b47-780d882bcb00	2	799.00	1598.00	Card	2026-05-11 17:39:41.680867+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-11 17:39:41.857146+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 17:39:41.857146+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- Data for Name: Staff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Staff" ("Id", "GymId", "StaffNumber", "FirstName", "LastName", "Email", "PhoneNumber", "UserId", "Role", "ProfilePictureUrl", "Specializations", "Bio", "ExperienceYears", "InstagramUrl", "PortfolioUrl", "ShiftTimings", "IsActive", "JoiningDate", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
019e04cc-c04e-772b-bf9c-fa797cf7cc38	472d8778-9a41-490d-aba9-3ccb02ab3ff3	STF-47576854	Josh	Cbum	josh.cbum@trainer.com	9865321245	019e04cc-8249-7f36-8645-8e48fb84b648	1	\N	{}		1				t	2026-05-07 23:36:26.106549+00	2026-05-07 23:36:28.909089+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-08 10:10:04.204439+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- Data for Name: SubscriptionRecords; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SubscriptionRecords" ("Id", "GymId", "PlanId", "StartDate", "EndDate", "IsActive", "IsTrial", "PriceAtPurchase", "Notes", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
0d55f94f-8e0c-4d5b-89bb-2e76f557867c	472d8778-9a41-490d-aba9-3ccb02ab3ff3	019dda83-b356-7f2c-898b-10ccf19c919d	2026-04-29 18:36:02.17362+00	2026-05-29 18:36:02.17362+00	t	f	499.00	\N	2026-04-29 18:36:02.461365+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:36:26.868493+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Users" ("Id", "FirstName", "LastName", "Email", "Phone", "PasswordHash", "GymId", "AddressId", "ProfilePictureUrl", "Role", "IsActive", "InvitationToken", "InvitationExpiry", "IsInvitationAccepted", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
6d24cf54-fdc6-4d0f-fa4b-08de825db656	Neel	Parghi	Admin@gymforge.com	7383052505	$2a$11$pbcvjK/sBD2axHfmLUrX0u85eTevxypfYw4aAVjrlwg63sGjabLGO	\N	5d33044b-f4fc-4dfa-e777-08dea39056ef	https://res.cloudinary.com/dy1fcodtg/image/upload/v1777276401/gymforge/avatars/71411517-bcd8-47e6-8476-ced69bb67c6f_WhatsApp Image.jpg	1	t	\N	\N	f	2026-04-26 07:14:46+00	00000000-0000-0000-0000-000000000000	2026-04-27 02:23:25+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
019e04cc-8249-7f36-8645-8e48fb84b648	Josh	Cbum	josh.cbum@trainer.com	9865321245	\N	472d8778-9a41-490d-aba9-3ccb02ab3ff3	\N		3	t	2782ab71-448b-4c3d-96c7-957210062fad	2026-05-14 23:36:09.913155+00	f	2026-05-07 23:36:28.909068+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 23:36:28.909068+00	019dda81-85f0-7db5-bb97-8eb9853f4687
019dda81-85f0-7db5-bb97-8eb9853f4687	NEEL	PARGHI	neelparghi192@gmail.com	+917383052505	$2a$11$6JTheAF0BxGxmSueVqlw4e/5Qdh7lsZ/rT3wYymMAczuq7nvVCzDu	472d8778-9a41-490d-aba9-3ccb02ab3ff3	4a5e2e8d-f3dd-4db6-84f8-675b09d7d293		2	t	\N	\N	t	2026-04-29 18:30:15.067248+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-09 07:34:27.829243+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
20260427095720_InitialCreate	10.0.0
20260503102931_InsertGymPlanTables	10.0.0
20260503122538_EditGymPlanTables	10.0.0
20260503154536_InsertGymMembersTable	10.0.0
20260505155807_InsertGymMembersTables	10.0.0
20260507231143_IsnsertGymStaff_Table	10.0.0
20260510063902_Insert_Inventory_Tables	10.0.0
20260510070334_Alter_Inventory_Tables	10.0.0
20260510070757_Alter_Inventory_Tables_Add_Indexing	10.0.0
20260510071339_AddGymIdIndexes	10.0.0
20260510102747_Alter_Equipment_Table	10.0.0
20260510120041_Insert_Maintenance_Table	10.0.0
20260510120319_AddMaintenanceFlag	10.0.0
20260510121208_FinalMaintenanceFlag	10.0.0
20260510121802_SyncMaintenanceSchema	10.0.0
\.


--
-- Name: Addresses PK_Addresses; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "PK_Addresses" PRIMARY KEY ("Id");


--
-- Name: Branches PK_Branches; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branches"
    ADD CONSTRAINT "PK_Branches" PRIMARY KEY ("Id");


--
-- Name: Equipment PK_Equipment; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Equipment"
    ADD CONSTRAINT "PK_Equipment" PRIMARY KEY ("Id");


--
-- Name: GymMembers PK_GymMembers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GymMembers"
    ADD CONSTRAINT "PK_GymMembers" PRIMARY KEY ("Id");


--
-- Name: GymPlans PK_GymPlans; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GymPlans"
    ADD CONSTRAINT "PK_GymPlans" PRIMARY KEY ("Id");


--
-- Name: Gyms PK_Gyms; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Gyms"
    ADD CONSTRAINT "PK_Gyms" PRIMARY KEY ("Id");


--
-- Name: InventoryItems PK_InventoryItems; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryItems"
    ADD CONSTRAINT "PK_InventoryItems" PRIMARY KEY ("Id");


--
-- Name: MaintenanceLogs PK_MaintenanceLogs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceLogs"
    ADD CONSTRAINT "PK_MaintenanceLogs" PRIMARY KEY ("Id");


--
-- Name: MemberMeasurements PK_MemberMeasurements; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberMeasurements"
    ADD CONSTRAINT "PK_MemberMeasurements" PRIMARY KEY ("Id");


--
-- Name: MemberSubscriptions PK_MemberSubscriptions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberSubscriptions"
    ADD CONSTRAINT "PK_MemberSubscriptions" PRIMARY KEY ("Id");


--
-- Name: PTAssignments PK_PTAssignments; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PTAssignments"
    ADD CONSTRAINT "PK_PTAssignments" PRIMARY KEY ("Id");


--
-- Name: Plans PK_Plans; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "PK_Plans" PRIMARY KEY ("Id");


--
-- Name: RefreshTokens PK_RefreshTokens; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "PK_RefreshTokens" PRIMARY KEY ("Id");


--
-- Name: SaaSConfigurations PK_SaaSConfigurations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaaSConfigurations"
    ADD CONSTRAINT "PK_SaaSConfigurations" PRIMARY KEY ("Id");


--
-- Name: SaaSPaymentTransactions PK_SaaSPaymentTransactions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaaSPaymentTransactions"
    ADD CONSTRAINT "PK_SaaSPaymentTransactions" PRIMARY KEY ("Id");


--
-- Name: SaleTransactions PK_SaleTransactions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaleTransactions"
    ADD CONSTRAINT "PK_SaleTransactions" PRIMARY KEY ("Id");


--
-- Name: Staff PK_Staff; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "PK_Staff" PRIMARY KEY ("Id");


--
-- Name: SubscriptionRecords PK_SubscriptionRecords; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubscriptionRecords"
    ADD CONSTRAINT "PK_SubscriptionRecords" PRIMARY KEY ("Id");


--
-- Name: Users PK_Users; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "PK_Users" PRIMARY KEY ("Id");


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: IX_Branches_AddressId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Branches_AddressId" ON public."Branches" USING btree ("AddressId");


--
-- Name: IX_Branches_GymId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Branches_GymId" ON public."Branches" USING btree ("GymId");


--
-- Name: IX_Equipment_GymId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Equipment_GymId" ON public."Equipment" USING btree ("GymId");


--
-- Name: IX_GymMembers_AddressId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_GymMembers_AddressId" ON public."GymMembers" USING btree ("AddressId");


--
-- Name: IX_GymMembers_GymId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_GymMembers_GymId" ON public."GymMembers" USING btree ("GymId");


--
-- Name: IX_GymMembers_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_GymMembers_UserId" ON public."GymMembers" USING btree ("UserId");


--
-- Name: IX_Gyms_AddressId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Gyms_AddressId" ON public."Gyms" USING btree ("AddressId");


--
-- Name: IX_Gyms_OwnerUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Gyms_OwnerUserId" ON public."Gyms" USING btree ("OwnerUserId");


--
-- Name: IX_InventoryItems_GymId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_InventoryItems_GymId" ON public."InventoryItems" USING btree ("GymId");


--
-- Name: IX_MaintenanceLogs_EquipmentId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_MaintenanceLogs_EquipmentId" ON public."MaintenanceLogs" USING btree ("EquipmentId");


--
-- Name: IX_MemberMeasurements_MemberId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_MemberMeasurements_MemberId" ON public."MemberMeasurements" USING btree ("MemberId");


--
-- Name: IX_MemberMeasurements_RecordedById; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_MemberMeasurements_RecordedById" ON public."MemberMeasurements" USING btree ("RecordedById");


--
-- Name: IX_MemberSubscriptions_GymPlanId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_MemberSubscriptions_GymPlanId" ON public."MemberSubscriptions" USING btree ("GymPlanId");


--
-- Name: IX_MemberSubscriptions_MemberId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_MemberSubscriptions_MemberId" ON public."MemberSubscriptions" USING btree ("MemberId");


--
-- Name: IX_PTAssignments_MemberId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_PTAssignments_MemberId" ON public."PTAssignments" USING btree ("MemberId");


--
-- Name: IX_PTAssignments_TrainerId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_PTAssignments_TrainerId" ON public."PTAssignments" USING btree ("TrainerId");


--
-- Name: IX_RefreshTokens_Token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_RefreshTokens_Token" ON public."RefreshTokens" USING btree ("Token");


--
-- Name: IX_RefreshTokens_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_RefreshTokens_UserId" ON public."RefreshTokens" USING btree ("UserId");


--
-- Name: IX_SaaSPaymentTransactions_GymId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_SaaSPaymentTransactions_GymId" ON public."SaaSPaymentTransactions" USING btree ("GymId");


--
-- Name: IX_SaaSPaymentTransactions_SubscriptionId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_SaaSPaymentTransactions_SubscriptionId" ON public."SaaSPaymentTransactions" USING btree ("SubscriptionId");


--
-- Name: IX_SaleTransactions_GymId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_SaleTransactions_GymId" ON public."SaleTransactions" USING btree ("GymId");


--
-- Name: IX_SaleTransactions_InventoryItemId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_SaleTransactions_InventoryItemId" ON public."SaleTransactions" USING btree ("InventoryItemId");


--
-- Name: IX_SaleTransactions_MemberId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_SaleTransactions_MemberId" ON public."SaleTransactions" USING btree ("MemberId");


--
-- Name: IX_Staff_GymId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Staff_GymId" ON public."Staff" USING btree ("GymId");


--
-- Name: IX_Staff_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Staff_UserId" ON public."Staff" USING btree ("UserId");


--
-- Name: IX_SubscriptionRecords_GymId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_SubscriptionRecords_GymId" ON public."SubscriptionRecords" USING btree ("GymId");


--
-- Name: IX_SubscriptionRecords_PlanId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_SubscriptionRecords_PlanId" ON public."SubscriptionRecords" USING btree ("PlanId");


--
-- Name: IX_Users_AddressId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Users_AddressId" ON public."Users" USING btree ("AddressId");


--
-- Name: Branches FK_Branches_Addresses_AddressId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branches"
    ADD CONSTRAINT "FK_Branches_Addresses_AddressId" FOREIGN KEY ("AddressId") REFERENCES public."Addresses"("Id") ON DELETE CASCADE;


--
-- Name: Branches FK_Branches_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branches"
    ADD CONSTRAINT "FK_Branches_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- Name: Equipment FK_Equipment_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Equipment"
    ADD CONSTRAINT "FK_Equipment_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- Name: GymMembers FK_GymMembers_Addresses_AddressId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GymMembers"
    ADD CONSTRAINT "FK_GymMembers_Addresses_AddressId" FOREIGN KEY ("AddressId") REFERENCES public."Addresses"("Id");


--
-- Name: GymMembers FK_GymMembers_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GymMembers"
    ADD CONSTRAINT "FK_GymMembers_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- Name: GymMembers FK_GymMembers_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GymMembers"
    ADD CONSTRAINT "FK_GymMembers_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id");


--
-- Name: Gyms FK_Gyms_Addresses_AddressId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Gyms"
    ADD CONSTRAINT "FK_Gyms_Addresses_AddressId" FOREIGN KEY ("AddressId") REFERENCES public."Addresses"("Id");


--
-- Name: Gyms FK_Gyms_Users_OwnerUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Gyms"
    ADD CONSTRAINT "FK_Gyms_Users_OwnerUserId" FOREIGN KEY ("OwnerUserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: InventoryItems FK_InventoryItems_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryItems"
    ADD CONSTRAINT "FK_InventoryItems_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- Name: MaintenanceLogs FK_MaintenanceLogs_Equipment_EquipmentId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceLogs"
    ADD CONSTRAINT "FK_MaintenanceLogs_Equipment_EquipmentId" FOREIGN KEY ("EquipmentId") REFERENCES public."Equipment"("Id") ON DELETE CASCADE;


--
-- Name: MemberMeasurements FK_MemberMeasurements_GymMembers_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberMeasurements"
    ADD CONSTRAINT "FK_MemberMeasurements_GymMembers_MemberId" FOREIGN KEY ("MemberId") REFERENCES public."GymMembers"("Id") ON DELETE CASCADE;


--
-- Name: MemberMeasurements FK_MemberMeasurements_Staff_RecordedById; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberMeasurements"
    ADD CONSTRAINT "FK_MemberMeasurements_Staff_RecordedById" FOREIGN KEY ("RecordedById") REFERENCES public."Staff"("Id") ON DELETE SET NULL;


--
-- Name: MemberSubscriptions FK_MemberSubscriptions_GymMembers_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberSubscriptions"
    ADD CONSTRAINT "FK_MemberSubscriptions_GymMembers_MemberId" FOREIGN KEY ("MemberId") REFERENCES public."GymMembers"("Id") ON DELETE CASCADE;


--
-- Name: MemberSubscriptions FK_MemberSubscriptions_GymPlans_GymPlanId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberSubscriptions"
    ADD CONSTRAINT "FK_MemberSubscriptions_GymPlans_GymPlanId" FOREIGN KEY ("GymPlanId") REFERENCES public."GymPlans"("Id") ON DELETE CASCADE;


--
-- Name: PTAssignments FK_PTAssignments_GymMembers_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PTAssignments"
    ADD CONSTRAINT "FK_PTAssignments_GymMembers_MemberId" FOREIGN KEY ("MemberId") REFERENCES public."GymMembers"("Id") ON DELETE CASCADE;


--
-- Name: PTAssignments FK_PTAssignments_Staff_TrainerId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PTAssignments"
    ADD CONSTRAINT "FK_PTAssignments_Staff_TrainerId" FOREIGN KEY ("TrainerId") REFERENCES public."Staff"("Id") ON DELETE RESTRICT;


--
-- Name: RefreshTokens FK_RefreshTokens_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "FK_RefreshTokens_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: SaaSPaymentTransactions FK_SaaSPaymentTransactions_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaaSPaymentTransactions"
    ADD CONSTRAINT "FK_SaaSPaymentTransactions_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- Name: SaaSPaymentTransactions FK_SaaSPaymentTransactions_SubscriptionRecords_SubscriptionId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaaSPaymentTransactions"
    ADD CONSTRAINT "FK_SaaSPaymentTransactions_SubscriptionRecords_SubscriptionId" FOREIGN KEY ("SubscriptionId") REFERENCES public."SubscriptionRecords"("Id") ON DELETE CASCADE;


--
-- Name: SaleTransactions FK_SaleTransactions_GymMembers_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaleTransactions"
    ADD CONSTRAINT "FK_SaleTransactions_GymMembers_MemberId" FOREIGN KEY ("MemberId") REFERENCES public."GymMembers"("Id") ON DELETE CASCADE;


--
-- Name: SaleTransactions FK_SaleTransactions_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaleTransactions"
    ADD CONSTRAINT "FK_SaleTransactions_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- Name: SaleTransactions FK_SaleTransactions_InventoryItems_InventoryItemId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaleTransactions"
    ADD CONSTRAINT "FK_SaleTransactions_InventoryItems_InventoryItemId" FOREIGN KEY ("InventoryItemId") REFERENCES public."InventoryItems"("Id") ON DELETE CASCADE;


--
-- Name: Staff FK_Staff_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "FK_Staff_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- Name: Staff FK_Staff_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "FK_Staff_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id");


--
-- Name: SubscriptionRecords FK_SubscriptionRecords_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubscriptionRecords"
    ADD CONSTRAINT "FK_SubscriptionRecords_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- Name: SubscriptionRecords FK_SubscriptionRecords_Plans_PlanId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubscriptionRecords"
    ADD CONSTRAINT "FK_SubscriptionRecords_Plans_PlanId" FOREIGN KEY ("PlanId") REFERENCES public."Plans"("Id") ON DELETE CASCADE;


--
-- Name: Users FK_Users_Addresses_AddressId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "FK_Users_Addresses_AddressId" FOREIGN KEY ("AddressId") REFERENCES public."Addresses"("Id");


--
-- PostgreSQL database dump complete
--

\unrestrict lBAFJ5WJywfG4gkkdFxNE7tAtk2Hpd4dvOZToeIJ1X1ncZfAzo5gi8dXObbbbGl

