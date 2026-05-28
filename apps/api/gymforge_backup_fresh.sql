--
-- PostgreSQL database dump
--

\restrict znW3UdKHehB2cNWEyYublSr5HoXcO1whdli8xw031sR74BvJLjkvdg0YEehYln0

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg12+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

-- Started on 2026-05-27 15:45:59 UTC

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: gymforge_db_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO gymforge_db_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16405)
-- Name: Addresses; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."Addresses" OWNER TO gymforge_db_user;

--
-- TOC entry 239 (class 1259 OID 16935)
-- Name: AttendanceLogs; Type: TABLE; Schema: public; Owner: gymforge_db_user
--

CREATE TABLE public."AttendanceLogs" (
    "Id" uuid NOT NULL,
    "BranchId" uuid,
    "MemberId" uuid NOT NULL,
    "CheckInTime" timestamp with time zone NOT NULL,
    "CheckOutTime" timestamp with time zone,
    "VerifiedByUserId" uuid,
    "VerificationMethod" character varying(50) NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


ALTER TABLE public."AttendanceLogs" OWNER TO gymforge_db_user;

--
-- TOC entry 226 (class 1259 OID 16519)
-- Name: Branches; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."Branches" OWNER TO gymforge_db_user;

--
-- TOC entry 242 (class 1259 OID 17013)
-- Name: CustomInvoices; Type: TABLE; Schema: public; Owner: gymforge_db_user
--

CREATE TABLE public."CustomInvoices" (
    "Id" uuid NOT NULL,
    "MemberId" uuid NOT NULL,
    "BillingType" text NOT NULL,
    "Description" text NOT NULL,
    "Amount" numeric(18,2) NOT NULL,
    "TaxRate" numeric(18,2) NOT NULL,
    "PaymentMethod" text NOT NULL,
    "Status" text NOT NULL,
    "TransactionDate" timestamp with time zone NOT NULL,
    "DueDate" timestamp with time zone NOT NULL,
    "GymId" uuid NOT NULL,
    "BranchId" uuid,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


ALTER TABLE public."CustomInvoices" OWNER TO gymforge_db_user;

--
-- TOC entry 235 (class 1259 OID 16788)
-- Name: Equipment; Type: TABLE; Schema: public; Owner: gymforge_db_user
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
    "IsInMaintenance" boolean DEFAULT false NOT NULL,
    "BranchId" uuid
);


ALTER TABLE public."Equipment" OWNER TO gymforge_db_user;

--
-- TOC entry 230 (class 1259 OID 16626)
-- Name: GymMembers; Type: TABLE; Schema: public; Owner: gymforge_db_user
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
    "UserId" uuid,
    "BranchId" uuid
);


ALTER TABLE public."GymMembers" OWNER TO gymforge_db_user;

--
-- TOC entry 229 (class 1259 OID 16609)
-- Name: GymPlans; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."GymPlans" OWNER TO gymforge_db_user;

--
-- TOC entry 224 (class 1259 OID 16477)
-- Name: Gyms; Type: TABLE; Schema: public; Owner: gymforge_db_user
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
    "ModifiedBy" uuid,
    "AutoEmailReceipts" boolean DEFAULT false NOT NULL,
    "DefaultTaxRate" numeric(5,2) DEFAULT 0.0 NOT NULL,
    "InvoicePrefix" text,
    "OverdueGraceDays" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Gyms" OWNER TO gymforge_db_user;

--
-- TOC entry 236 (class 1259 OID 16811)
-- Name: InventoryItems; Type: TABLE; Schema: public; Owner: gymforge_db_user
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
    "ImageUrl" text,
    "BranchId" uuid
);


ALTER TABLE public."InventoryItems" OWNER TO gymforge_db_user;

--
-- TOC entry 237 (class 1259 OID 16835)
-- Name: MaintenanceLogs; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."MaintenanceLogs" OWNER TO gymforge_db_user;

--
-- TOC entry 233 (class 1259 OID 16728)
-- Name: MemberMeasurements; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."MemberMeasurements" OWNER TO gymforge_db_user;

--
-- TOC entry 231 (class 1259 OID 16651)
-- Name: MemberSubscriptions; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."MemberSubscriptions" OWNER TO gymforge_db_user;

--
-- TOC entry 234 (class 1259 OID 16750)
-- Name: PTAssignments; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."PTAssignments" OWNER TO gymforge_db_user;

--
-- TOC entry 221 (class 1259 OID 16420)
-- Name: Plans; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."Plans" OWNER TO gymforge_db_user;

--
-- TOC entry 225 (class 1259 OID 16501)
-- Name: RefreshTokens; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."RefreshTokens" OWNER TO gymforge_db_user;

--
-- TOC entry 222 (class 1259 OID 16435)
-- Name: SaaSConfigurations; Type: TABLE; Schema: public; Owner: gymforge_db_user
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
    "ModifiedBy" uuid,
    "GstNo" text
);


ALTER TABLE public."SaaSConfigurations" OWNER TO gymforge_db_user;

--
-- TOC entry 228 (class 1259 OID 16571)
-- Name: SaaSPaymentTransactions; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."SaaSPaymentTransactions" OWNER TO gymforge_db_user;

--
-- TOC entry 238 (class 1259 OID 16856)
-- Name: SaleTransactions; Type: TABLE; Schema: public; Owner: gymforge_db_user
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
    "ModifiedBy" uuid,
    "BranchId" uuid
);


ALTER TABLE public."SaleTransactions" OWNER TO gymforge_db_user;

--
-- TOC entry 232 (class 1259 OID 16699)
-- Name: Staff; Type: TABLE; Schema: public; Owner: gymforge_db_user
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
    "ModifiedBy" uuid,
    "BranchId" uuid,
    "IsCheckedIn" boolean DEFAULT false NOT NULL,
    "LastCheckInTime" timestamp with time zone
);


ALTER TABLE public."Staff" OWNER TO gymforge_db_user;

--
-- TOC entry 243 (class 1259 OID 17053)
-- Name: StaffAttendanceLogs; Type: TABLE; Schema: public; Owner: gymforge_db_user
--

CREATE TABLE public."StaffAttendanceLogs" (
    "Id" uuid NOT NULL,
    "GymId" uuid NOT NULL,
    "BranchId" uuid,
    "StaffId" uuid NOT NULL,
    "CheckInTime" timestamp with time zone NOT NULL,
    "CheckOutTime" timestamp with time zone,
    "Notes" text,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


ALTER TABLE public."StaffAttendanceLogs" OWNER TO gymforge_db_user;

--
-- TOC entry 240 (class 1259 OID 16961)
-- Name: StaffPayoutLogs; Type: TABLE; Schema: public; Owner: gymforge_db_user
--

CREATE TABLE public."StaffPayoutLogs" (
    "Id" uuid NOT NULL,
    "GymId" uuid NOT NULL,
    "BranchId" uuid,
    "StaffId" uuid NOT NULL,
    "MonthKey" text NOT NULL,
    "BaseSalarySnapshot" numeric(18,2) NOT NULL,
    "Commissions" numeric(18,2) NOT NULL,
    "TotalPayout" numeric(18,2) NOT NULL,
    "Status" text NOT NULL,
    "PayoutDate" timestamp with time zone,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


ALTER TABLE public."StaffPayoutLogs" OWNER TO gymforge_db_user;

--
-- TOC entry 241 (class 1259 OID 16983)
-- Name: StaffPayrollRules; Type: TABLE; Schema: public; Owner: gymforge_db_user
--

CREATE TABLE public."StaffPayrollRules" (
    "Id" uuid NOT NULL,
    "GymId" uuid NOT NULL,
    "BranchId" uuid,
    "StaffId" uuid NOT NULL,
    "BaseSalary" numeric(18,2) NOT NULL,
    "PTCommissionRate" numeric(5,2) NOT NULL,
    "RehabCommissionRate" numeric(5,2) NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "ModifiedOn" timestamp with time zone,
    "ModifiedBy" uuid
);


ALTER TABLE public."StaffPayrollRules" OWNER TO gymforge_db_user;

--
-- TOC entry 227 (class 1259 OID 16544)
-- Name: SubscriptionRecords; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."SubscriptionRecords" OWNER TO gymforge_db_user;

--
-- TOC entry 223 (class 1259 OID 16454)
-- Name: Users; Type: TABLE; Schema: public; Owner: gymforge_db_user
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


ALTER TABLE public."Users" OWNER TO gymforge_db_user;

--
-- TOC entry 219 (class 1259 OID 16398)
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: gymforge_db_user
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO gymforge_db_user;

--
-- TOC entry 3619 (class 0 OID 16405)
-- Dependencies: 220
-- Data for Name: Addresses; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."Addresses" ("Id", "Address1", "Address2", "City", "State", "Country", "PostalCode", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
5d33044b-f4fc-4dfa-e777-08dea39056ef	Se 5/A, 1269/2 Gandhinagar, Gujarat	\N	Gandhinagar	Gujarat		382007	2026-04-26 07:14:46+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-27 02:23:25+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
d7f88a13-9c0c-4533-84db-0854b9ddbf6f			Gandhinagar	Gujarat	India	382007	2026-04-29 18:35:27.065371+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:35:27.065371+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
f797397e-8dff-425c-88f3-bdcf272ec140			Gandhinagar	Gujarat	India	382007	2026-04-29 18:35:27.065342+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:35:27.065342+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
019df900-dae5-7748-a07a-5bbdcd2cce2b	Se 5/A, 1269/2 Gandhinagar, Gujarat	\N	Gandhinagar	Gujarat	India	382007	2026-05-05 16:37:56.137014+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-05 16:37:56.137014+00	019dda81-85f0-7db5-bb97-8eb9853f4687
019dfe95-73ae-753c-8e4f-f7e8cb414bc6	Bleeker Street 16 A	\N	LA		US		2026-05-06 18:38:20.61074+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-06 18:38:20.61074+00	019dda81-85f0-7db5-bb97-8eb9853f4687
019e003d-ce37-78eb-b1d8-62d0047ef6c8	12th Street park avenue	\N	Star city	CS	US		2026-05-07 02:21:51.051752+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 02:21:51.051752+00	019dda81-85f0-7db5-bb97-8eb9853f4687
4a5e2e8d-f3dd-4db6-84f8-675b09d7d293	Sector 5/A Plot no.1269/2 Gandhinagar, Gujarat	\N	Gandhinagar	Gujarat		382006	2026-05-09 07:34:07.789156+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-09 07:34:27.829259+00	019dda81-85f0-7db5-bb97-8eb9853f4687
41606115-9e61-448f-950e-c0db701eefca	st. 12 down street 	\N	LA		US		2026-05-16 11:35:49.201289+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:35:49.201289+00	019dda81-85f0-7db5-bb97-8eb9853f4687
06c19fd0-eece-4aab-aadc-887619144420	15th street new downtown 	\N	Alabama	Alabama	US		2026-05-16 11:40:53.452259+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:40:53.452259+00	019dda81-85f0-7db5-bb97-8eb9853f4687
019e3691-9a0e-7edd-99ef-9332435a613a	Infocity Towner 2	\N	Gandhinagar	Gujarat	India	382001	2026-05-17 15:32:52.38021+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 15:32:52.38021+00	019dda81-85f0-7db5-bb97-8eb9853f4687
b311452c-8121-45dc-bf5f-a487734d8d14	Infocity Towner 2	\N	Gandhinagar	Gujarat	India	382001	2026-05-17 15:32:52.380191+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 15:32:52.380191+00	019dda81-85f0-7db5-bb97-8eb9853f4687
b79c3c5e-302a-4bc8-af4a-576105b8a8ce	Sector 12/A Plot no 123/1 	\N	Gandhinagar	Gujarat	India	382012	2026-05-17 17:43:41.377037+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 17:43:41.377037+00	019dda81-85f0-7db5-bb97-8eb9853f4687
019dda86-48a8-7d09-a62f-c5b456c5a8d6	Sector 11 Meghmalhar Complex 		Gandhinagar	Gujarat	India	382007	2026-04-29 18:35:27.065376+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-24 07:01:16.389034+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- TOC entry 3638 (class 0 OID 16935)
-- Dependencies: 239
-- Data for Name: AttendanceLogs; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."AttendanceLogs" ("Id", "BranchId", "MemberId", "CheckInTime", "CheckOutTime", "VerifiedByUserId", "VerificationMethod", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
20871460-c617-4ac6-a05d-4e3d684d1d7a	\N	019e3f21-3e7d-734a-af3d-0b58dd22af99	2026-05-22 03:27:48.613573+00	2026-05-22 03:31:13.522435+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-22 03:27:48.615978+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-22 03:31:13.522757+00	019dda81-85f0-7db5-bb97-8eb9853f4687
3fa99150-f7e8-42f5-8c62-3b7fe25fc0e9	\N	019e3709-5dd7-706a-8fed-f167e4e836ed	2026-05-22 19:47:37.137425+00	2026-05-22 19:51:43.513589+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-22 19:47:37.197444+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-22 19:51:43.514385+00	019dda81-85f0-7db5-bb97-8eb9853f4687
34b9aa7b-87b5-4afa-a54b-ad2da8ccfda6	\N	019e3709-5dd7-706a-8fed-f167e4e836ed	2026-05-23 04:53:43.925691+00	2026-05-23 05:17:37.514377+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-23 04:53:43.992533+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 05:17:37.514904+00	019dda81-85f0-7db5-bb97-8eb9853f4687
33ae60f1-95a1-4359-8d71-8146838a0d1a	\N	019e309f-d28b-7c2e-880b-b88f9ef8079b	2026-05-23 11:20:02.633851+00	2026-05-23 18:26:35.393554+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-23 11:20:02.634263+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 18:26:35.43384+00	019dda81-85f0-7db5-bb97-8eb9853f4687
9389e99f-2c91-45b6-a54a-67cc0860f0bd	\N	019e3098-fc67-78d2-94da-b7b6998de969	2026-05-23 11:19:56.453229+00	2026-05-23 18:26:36.852005+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-23 11:19:56.454037+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 18:26:36.852224+00	019dda81-85f0-7db5-bb97-8eb9853f4687
e6110544-2ad9-462d-aa2e-dd9bba861041	\N	019e309e-c26a-795a-8156-3c9a3fa04701	2026-05-23 11:19:45.412091+00	2026-05-23 18:26:37.954919+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-23 11:19:45.470416+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 18:26:37.955139+00	019dda81-85f0-7db5-bb97-8eb9853f4687
c1696b8b-bdc4-4baa-8613-48e2314f27ae	\N	019e309b-6e47-730c-9d40-bc9adc2d1b30	2026-05-23 18:27:05.539451+00	2026-05-25 17:09:21.467902+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-23 18:27:05.555029+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-25 17:09:21.500049+00	019dda81-85f0-7db5-bb97-8eb9853f4687
9542368f-4162-4656-b2b7-887c8d9cfe14	\N	019e309d-3880-7e34-a2ac-995047490a6d	2026-05-26 02:07:19.309075+00	2026-05-26 02:50:56.785843+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-26 02:07:19.309569+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 02:50:56.786583+00	019dda81-85f0-7db5-bb97-8eb9853f4687
6d09d876-760e-40e0-b0bb-69931c726a7b	\N	019e3f21-3e7d-734a-af3d-0b58dd22af99	2026-05-26 02:07:09.235359+00	2026-05-26 03:09:07.209008+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-26 02:07:09.29113+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 03:09:07.261947+00	019dda81-85f0-7db5-bb97-8eb9853f4687
5ad31e13-6d1f-4ea9-9f51-b09b0522eba6	\N	019e309f-d28b-7c2e-880b-b88f9ef8079b	2026-05-26 02:07:14.557474+00	2026-05-26 03:09:09.718083+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-26 02:07:14.558704+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 03:09:09.718317+00	019dda81-85f0-7db5-bb97-8eb9853f4687
a7185ce7-85cb-425b-b51e-2e743372f9e4	\N	019e3709-5dd7-706a-8fed-f167e4e836ed	2026-05-26 03:08:28.257882+00	2026-05-26 03:20:57.798891+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-26 03:08:28.264647+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 03:20:57.800391+00	019dda81-85f0-7db5-bb97-8eb9853f4687
fce5d089-3594-42d7-ad5f-b05ecb8c8bc9	\N	019e3096-db4b-78d2-a67a-877c83795249	2026-05-26 03:09:18.351475+00	2026-05-26 03:20:59.666678+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-26 03:09:18.373608+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 03:20:59.666819+00	019dda81-85f0-7db5-bb97-8eb9853f4687
0420063a-0dd1-4c84-9219-f75057eaca2a	78c8547b-0380-4525-9603-c9551dfd64ff	019e309b-6e47-730c-9d40-bc9adc2d1b30	2026-05-26 03:10:08.07657+00	2026-05-26 03:21:01.445316+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-26 03:10:08.079115+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 03:21:01.445473+00	019dda81-85f0-7db5-bb97-8eb9853f4687
6f67b953-7a14-4353-98ed-b19ef7f32912	\N	019e3092-3677-7a1b-940c-fe52965b6862	2026-05-26 03:12:34.692455+00	2026-05-26 03:21:02.535798+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-26 03:12:34.754302+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 03:21:02.535972+00	019dda81-85f0-7db5-bb97-8eb9853f4687
602573a6-831a-47fc-9fd6-5a0f0e813446	\N	019e309f-d28b-7c2e-880b-b88f9ef8079b	2026-05-26 03:15:18.270976+00	2026-05-26 03:21:04.186227+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-26 03:15:18.274671+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 03:21:04.186323+00	019dda81-85f0-7db5-bb97-8eb9853f4687
372a6ee3-0c39-4a62-a5d5-6cc4dfcd1d7f	78c8547b-0380-4525-9603-c9551dfd64ff	019e3098-fc67-78d2-94da-b7b6998de969	2026-05-26 03:15:59.432584+00	2026-05-26 03:21:05.820049+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-26 03:15:59.435076+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 03:21:05.820189+00	019dda81-85f0-7db5-bb97-8eb9853f4687
ab242bfb-7088-4905-8f17-f45572719abd	78c8547b-0380-4525-9603-c9551dfd64ff	019e003d-ce36-77b0-9a77-a3c7d7c3caee	2026-05-26 03:20:26.234399+00	2026-05-26 03:22:09.006658+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-26 03:20:26.327078+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 03:22:09.006813+00	019dda81-85f0-7db5-bb97-8eb9853f4687
036c04b8-34af-4799-a30d-39df649ad4f0	78c8547b-0380-4525-9603-c9551dfd64ff	019dfe95-73ad-70b5-a585-ee4e4653d314	2026-05-26 15:44:39.058873+00	2026-05-27 01:05:22.674727+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-26 15:44:39.635904+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 01:05:22.735813+00	019dda81-85f0-7db5-bb97-8eb9853f4687
d86a2f79-8310-4260-99e7-8ac4e6be34f9	78c8547b-0380-4525-9603-c9551dfd64ff	019e3092-3677-7a1b-940c-fe52965b6862	2026-05-27 01:05:44.582332+00	2026-05-27 01:41:55.294892+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-27 01:05:44.588904+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 01:41:55.33388+00	019dda81-85f0-7db5-bb97-8eb9853f4687
41c80e20-f134-4aab-904b-8219499b14a4	70802e1f-1a45-4563-b5fa-487f078246a7	019e3709-5dd7-706a-8fed-f167e4e836ed	2026-05-27 01:06:02.387872+00	2026-05-27 01:57:14.664815+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-27 01:06:02.388204+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 01:57:14.696034+00	019dda81-85f0-7db5-bb97-8eb9853f4687
a93de1e4-e7bd-47da-945a-d5e1fd96959d	78c8547b-0380-4525-9603-c9551dfd64ff	019e3f21-3e7d-734a-af3d-0b58dd22af99	2026-05-27 01:05:38.583173+00	2026-05-27 01:57:16.456691+00	019dda81-85f0-7db5-bb97-8eb9853f4687	Manual	2026-05-27 01:05:38.598521+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 01:57:16.457051+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- TOC entry 3625 (class 0 OID 16519)
-- Dependencies: 226
-- Data for Name: Branches; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."Branches" ("Id", "GymId", "Name", "AddressId", "ContactNumber", "IsMainBranch", "IsActive", "OpenTime", "CloseTime", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
70802e1f-1a45-4563-b5fa-487f078246a7	472d8778-9a41-490d-aba9-3ccb02ab3ff3	Infocity Branch	019e3691-9a0e-7edd-99ef-9332435a613a	9898784565	f	t	06:00	22:00	2026-05-17 15:32:52.380208+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 15:32:52.380208+00	019dda81-85f0-7db5-bb97-8eb9853f4687
78c8547b-0380-4525-9603-c9551dfd64ff	472d8778-9a41-490d-aba9-3ccb02ab3ff3	Suman City Branch	019dda86-48a8-7d09-a62f-c5b456c5a8d6	07383052505	t	t	06:00	22:00	2026-04-29 18:35:27.065374+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-24 07:01:16.38901+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- TOC entry 3641 (class 0 OID 17013)
-- Dependencies: 242
-- Data for Name: CustomInvoices; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."CustomInvoices" ("Id", "MemberId", "BillingType", "Description", "Amount", "TaxRate", "PaymentMethod", "Status", "TransactionDate", "DueDate", "GymId", "BranchId", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
d293493b-b2f4-4841-8163-8da62303a656	019e3f21-3e7d-734a-af3d-0b58dd22af99	Personal Training	Personal Training Invoice	10000.00	18.00	UPI	Paid	2026-05-24 15:45:12.157314+00	2026-06-08 15:45:12.157365+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	\N	2026-05-24 15:45:12.191192+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 15:45:12.191192+00	019dda81-85f0-7db5-bb97-8eb9853f4687
306d081f-af5e-4283-b3a6-9c44965b82f7	019e309d-3880-7e34-a2ac-995047490a6d	Personal Training	Personal Training Invoice	5000.00	18.00	UPI	Paid	2026-05-27 01:37:55.510917+00	2026-06-11 01:37:55.510978+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	\N	2026-05-27 01:37:55.523203+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 01:37:55.523203+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- TOC entry 3634 (class 0 OID 16788)
-- Dependencies: 235
-- Data for Name: Equipment; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."Equipment" ("Id", "Name", "SerialNumber", "Category", "PurchaseDate", "WarrantyExpiry", "CurrentCondition", "HealthPercentage", "MaintenanceIntervalMonths", "LastServiceDate", "GymId", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "ImageUrl", "IsInMaintenance", "BranchId") FROM stdin;
019e1131-0b4e-7f58-b271-d79154ddf40f	Matrix Treadmill Trex #2	SN-98263721	Cardio	2026-05-10 00:00:00+00	2027-05-10 00:00:00+00	Excellent	100	6	\N	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-10 14:51:27.375083+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 10:40:22.736517+00	019dda81-85f0-7db5-bb97-8eb9853f4687	https://res.cloudinary.com/dy1fcodtg/image/upload/v1778409619/gymforge/equipment/9dc5930c-f1cc-4f85-926e-b04838bfbe88_TAC-2000-Treadmill.jpg	f	\N
019e1127-d0f0-779b-b165-9b249b5c9511	Matrix Treadmill Trex #1	SN-78451215	Cardio	2026-05-11 05:30:00+00	2026-10-10 05:30:00+00	Excellent	100	6	2026-05-10 00:00:00+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-12 10:41:22.630124+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 12:48:47.319953+00	019dda81-85f0-7db5-bb97-8eb9853f4687	https://res.cloudinary.com/dy1fcodtg/image/upload/v1778408906/gymforge/equipment/e7b1f3d3-c885-44df-9e8a-087c7f6911fe_TAC-2000-Treadmill.jpg	f	\N
019e1a2d-98a0-7ce7-967f-b938ce3ddb26	Smith Machine	SM-784514	Strength	2026-05-12 00:00:00+00	2027-05-12 00:00:00+00	Excellent	100	6	2026-05-12 00:00:00+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-12 03:14:16.451038+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-12 03:16:46.950305+00	019dda81-85f0-7db5-bb97-8eb9853f4687	https://res.cloudinary.com/dy1fcodtg/image/upload/v1778555654/gymforge/equipment/fb6c12de-407d-4f5d-8f21-a27a8d759e1a_smith_machine.jpg	f	\N
\.


--
-- TOC entry 3629 (class 0 OID 16626)
-- Dependencies: 230
-- Data for Name: GymMembers; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."GymMembers" ("Id", "GymId", "MembershipNumber", "FirstName", "LastName", "Email", "PhoneNumber", "DateOfBirth", "Gender", "ProfilePictureUrl", "EmergencyContactName", "EmergencyContactPhone", "JoiningDate", "Status", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "AddressId", "BloodGroup", "FitnessGoals", "MedicalConditions", "UserId", "BranchId") FROM stdin;
019e309e-c26a-795a-8156-3c9a3fa04701	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-13699679	Darrell	Henderson	DarrellPHenderson@teleworm.us	47500861	1998-08-14 00:00:00+00	1	\N	\N	\N	2026-05-16 17:19:31.369967+00	1	2026-05-16 17:19:31.370521+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:49:43.428307+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	B+	{"Muscle Gain","Weight Loss","Strength & Conditioning"}	\N	\N	\N
019dfe95-73ad-70b5-a585-ee4e4653d314	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-05808369	Shawn	Levis	shawn.levis@gmail.com	9887655465	2004-02-03 00:00:00+00	1	\N	\N	\N	2026-05-08 14:38:20.580792+00	1	2026-05-08 14:38:20.610724+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 02:17:55.419722+00	019dda81-85f0-7db5-bb97-8eb9853f4687	019dfe95-73ae-753c-8e4f-f7e8cb414bc6	B+	{"Muscle Gain","Strength & Conditioning","Weight Loss"}	\N	\N	\N
019e309f-d28b-7c2e-880b-b88f9ef8079b	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-10354375	Jess	Cotton	jesscotton@gmail.com	784512895	2000-04-01 00:00:00+00	2	\N	\N	\N	2026-05-16 11:50:41.035437+00	1	2026-05-16 11:50:41.035866+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:50:41.035866+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	AB+	{"Sports Training"}	\N	\N	\N
019e3709-5dd7-706a-8fed-f167e4e836ed	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-12474644	Jay	Patel	jaypatel@gmail.com	9865321212	2000-04-05 00:00:00+00	1	\N	Het Patel	7856123212	2026-05-17 17:43:41.247365+00	1	2026-05-17 17:43:41.376693+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 17:43:41.376693+00	019dda81-85f0-7db5-bb97-8eb9853f4687	b79c3c5e-302a-4bc8-af4a-576105b8a8ce	O+	{"Strength & Conditioning","Weight Loss","Muscle Gain"}	\N	\N	70802e1f-1a45-4563-b5fa-487f078246a7
019e3f21-3e7d-734a-af3d-0b58dd22af99	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-37364767	Neel	Parghi	neel.parghi@thegatewaycorp.co.in	787895454	2026-05-19 00:00:00+00	2	\N	\N	\N	2026-05-19 07:26:43.73641+00	1	2026-05-19 07:26:44.929116+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-21 06:14:05.397159+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	O+	{"Weight Loss","Muscle Gain"}	\N	\N	78c8547b-0380-4525-9603-c9551dfd64ff
019e003d-ce36-77b0-9a77-a3c7d7c3caee	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-10207700	Barry	Allan	barry.allan@gmail.com	9898653212	2000-12-05 00:00:00+00	1	\N	Neel Parghi	7878898945	2026-05-07 02:21:51.02066+00	1	2026-05-07 02:21:51.051738+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 09:49:30.405524+00	019dda81-85f0-7db5-bb97-8eb9853f4687	019e003d-ce37-78eb-b1d8-62d0047ef6c8	AB+	{"Muscle Gain"}	\N	\N	\N
019df900-dacd-7d10-9094-4d25f14e0ec8	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-60333121	John	Smith	johnsmith@gmail.com	9898989898	2000-05-05 00:00:00+00	1	\N	\N	\N	2026-05-06 14:30:00+00	1	2026-05-07 07:07:56.136993+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 01:45:17.733755+00	019dda81-85f0-7db5-bb97-8eb9853f4687	019df900-dae5-7748-a07a-5bbdcd2cce2b	O+	{"Weight Loss","Muscle Gain"}	\N	\N	\N
019e3092-3677-7a1b-940c-fe52965b6862	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-90935255	Alec	King	Alec@yahoo.com	788945562	1978-08-23 00:00:00+00	1	\N	Alec Sr	7889564510	2026-05-16 11:35:49.093427+00	1	2026-05-16 11:35:49.201271+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:35:49.201271+00	019dda81-85f0-7db5-bb97-8eb9853f4687	41606115-9e61-448f-950e-c0db701eefca	B+	{"Weight Loss","Muscle Gain"}	\N	\N	\N
019e3096-db4b-78d2-a67a-877c83795249	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-34500977	Alice	jorden	alice@gmail.com	0878545457	2005-02-01 00:00:00+00	2	\N	\N	\N	2026-05-16 11:40:53.450097+00	1	2026-05-16 11:40:53.452244+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:40:53.452244+00	019dda81-85f0-7db5-bb97-8eb9853f4687	06c19fd0-eece-4aab-aadc-887619144420	\N	{}	\N	\N	\N
019e3098-fc67-78d2-94da-b7b6998de969	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-29993189	Denis	evy	denevy@gmail.com	7548956424	2003-02-13 00:00:00+00	1	\N	Emy evy	568956457	2026-05-16 11:43:12.999318+00	1	2026-05-16 11:43:12.999834+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:43:12.999834+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	A+	{"General Fitness"}	\N	\N	\N
019e309b-6e47-730c-9d40-bc9adc2d1b30	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-32238946	Kellee	Kimberly	KelleeKKimberly@gmail.com	2133451596	1998-07-09 00:00:00+00	2	\N	\N	\N	2026-05-16 11:45:53.223894+00	1	2026-05-16 11:45:53.225742+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:45:53.225742+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	B+	{"Flexibility & Mobility"}	\N	\N	\N
019e309c-4da1-7a24-9f6e-98614fbcc9eb	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-04013388	Trevor	gary	garytrevor@gmail.com	9878459651	1999-04-12 00:00:00+00	1	\N	\N	\N	2026-05-16 11:46:50.401338+00	1	2026-05-16 11:46:50.402215+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:46:50.402215+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	AB-	{}	\N	\N	\N
019e309d-3880-7e34-a2ac-995047490a6d	472d8778-9a41-490d-aba9-3ccb02ab3ff3	MEM-05287369	Scott	Fetter	ScottJFetter@gmail.com	96105589	2001-05-04 00:00:00+00	1	\N	\N	\N	2026-05-16 11:47:50.528736+00	1	2026-05-16 11:47:50.529311+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 11:47:50.529311+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	O+	{"Strength & Conditioning"}	\N	\N	\N
\.


--
-- TOC entry 3628 (class 0 OID 16609)
-- Dependencies: 229
-- Data for Name: GymPlans; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."GymPlans" ("Id", "GymOwnerId", "Name", "Description", "Price", "DurationMonths", "MaxBranches", "Features", "IsActive", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "DiscountedPrice", "ExtendedMonths", "IsOffer") FROM stdin;
019ded98-c1a8-7ec4-b817-4a0d7be1f8cf	019dda81-85f0-7db5-bb97-8eb9853f4687	3 Months Plan	\N	5000.00	3	1	{Yoga,"Diet Plan",Cardio}	t	2026-05-04 20:28:24.48869+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 11:59:46.18264+00	\N	\N	\N	f
019dedc6-758b-7969-ba24-e35d71b7319d	019dda81-85f0-7db5-bb97-8eb9853f4687	1 Month Plan	one month gym plan	1500.00	1	1	{Yoga,Cardio}	t	2026-05-04 21:18:19.6598+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 23:15:36.634492+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	\N	f
019deda0-58f7-700d-88e1-20cc8fc655ba	019dda81-85f0-7db5-bb97-8eb9853f4687	6 Months Plan	\N	8000.00	6	2	{"Steam bath",Yoga,Cardio,"Diet Plan"}	t	2026-05-05 18:36:41.976279+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 23:15:40.381618+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N	\N	f
019ded8b-cf03-70f6-af04-12d61f8e764f	019dda81-85f0-7db5-bb97-8eb9853f4687	12 Months Plan	Yearly membership access	12000.00	12	5	{"One month PT","Steam Bath","Locker Access","Diet Plans"}	t	2026-05-09 21:14:15.962715+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 09:52:42.740435+00	019dda81-85f0-7db5-bb97-8eb9853f4687	10000.00	0	f
\.


--
-- TOC entry 3623 (class 0 OID 16477)
-- Dependencies: 224
-- Data for Name: Gyms; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."Gyms" ("Id", "GymName", "BrandName", "Email", "Phone", "WebsiteUrl", "GstNumber", "RegistrationNumber", "EstablishedDate", "OwnerUserId", "AddressId", "LogoUrl", "BannerUrl", "Description", "IsActive", "IsVerified", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "AutoEmailReceipts", "DefaultTaxRate", "InvoicePrefix", "OverdueGraceDays") FROM stdin;
472d8778-9a41-490d-aba9-3ccb02ab3ff3	The Gym World	\N	\N	\N	\N	27AAAAA1111A1Z1	\N	2026-01-04 16:00:00+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f797397e-8dff-425c-88f3-bdcf272ec140	\N	\N	\N	t	t	2026-05-03 10:35:27.065368+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-26 15:47:39.546558+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f	0.00	\N	0
\.


--
-- TOC entry 3635 (class 0 OID 16811)
-- Dependencies: 236
-- Data for Name: InventoryItems; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."InventoryItems" ("Id", "Name", "SKU", "Category", "Description", "BuyingPrice", "SellingPrice", "StockQuantity", "ReorderLevel", "IsActive", "GymId", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "ImageUrl", "BranchId") FROM stdin;
019e110c-3ee5-7de4-aba6-db25fbd61a54	Whey Protein 1 Kg Muscle blaze 	SUP-5173	Supplements	Whey Protein 1 Kg Muscle Blaze Rich Cocoa	2449.00	2499.00	4	1	t	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-11 23:11:16.261387+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 14:06:17.588624+00	019dda81-85f0-7db5-bb97-8eb9853f4687	https://res.cloudinary.com/dy1fcodtg/image/upload/v1778408253/gymforge/products/04b42426-4bfb-42f5-8579-a1196b1e9d4c_wheyprotien.jpg	\N
019e1417-3918-79f4-9b47-780d882bcb00	Creatine Micronized Monohydrate 500gm 	SUP-8166	Supplements	Creatine Micronized Monohydrate 500gm Muscle blaze - Watermalon flavour	799.00	799.00	2	1	t	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-11 20:52:06.836799+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 17:39:54.808937+00	019dda81-85f0-7db5-bb97-8eb9853f4687	https://res.cloudinary.com/dy1fcodtg/image/upload/v1778453527/gymforge/products/e37e7310-fae6-4077-91e4-126681ec7df3_creatine.jpg	\N
\.


--
-- TOC entry 3636 (class 0 OID 16835)
-- Dependencies: 237
-- Data for Name: MaintenanceLogs; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."MaintenanceLogs" ("Id", "ServiceType", "Description", "TechnicianName", "ScheduledDate", "CompletedDate", "Status", "Notes", "EquipmentId", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "Cost", "EstimatedEndDate") FROM stdin;
019e11d4-fec2-7217-becc-41c70e3a6415	Routine	Routine checkup	Unknown	2026-05-10 00:00:00+00	2026-05-10 00:00:00+00	Completed	\N	019e1127-d0f0-779b-b165-9b249b5c9511	2026-05-10 12:20:32.266655+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 12:48:47.319157+00	019dda81-85f0-7db5-bb97-8eb9853f4687	500	2026-05-11 00:00:00+00
019e1a2f-a025-7330-b682-e5cf38da131e	Routine	Routine Checkup	Techfit solutions	2026-05-12 00:00:00+00	2026-05-12 00:00:00+00	Completed	\N	019e1a2d-98a0-7ce7-967f-b938ce3ddb26	2026-05-12 03:16:29.553053+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-12 03:16:46.950279+00	019dda81-85f0-7db5-bb97-8eb9853f4687	500	2026-05-13 00:00:00+00
\.


--
-- TOC entry 3632 (class 0 OID 16728)
-- Dependencies: 233
-- Data for Name: MemberMeasurements; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."MemberMeasurements" ("Id", "MemberId", "RecordedById", "Weight", "Height", "BodyFatPercentage", "BMI", "Notes", "Date", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
\.


--
-- TOC entry 3630 (class 0 OID 16651)
-- Dependencies: 231
-- Data for Name: MemberSubscriptions; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
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
019e3709-5e03-7bd9-8248-7426efe3bea9	019e3709-5dd7-706a-8fed-f167e4e836ed	019ded98-c1a8-7ec4-b817-4a0d7be1f8cf	3 Months Plan	5000.00	3	0	2026-05-17 17:43:41.311395+00	2026-08-17 17:43:41.311395+00	t	2	2026-05-17 17:43:41.377042+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 17:43:41.377042+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
019e3f21-3fa9-71dd-a69e-a6324a09d052	019e3f21-3e7d-734a-af3d-0b58dd22af99	019ded8b-cf03-70f6-af04-12d61f8e764f	12 Months Plan	12000.00	12	0	2026-05-19 07:26:44.132145+00	2027-05-19 07:26:44.132145+00	t	2	2026-05-19 07:26:44.929148+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-21 06:14:05.397187+00	019dda81-85f0-7db5-bb97-8eb9853f4687	f
\.


--
-- TOC entry 3633 (class 0 OID 16750)
-- Dependencies: 234
-- Data for Name: PTAssignments; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."PTAssignments" ("Id", "TrainerId", "MemberId", "StartDate", "EndDate", "SessionFrequency", "PreferredSlot", "IsActive", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
019e4660-1b44-759f-b67e-33292496ba2a	019e04cc-c04e-772b-bf9c-fa797cf7cc38	019e3f21-3e7d-734a-af3d-0b58dd22af99	2026-05-20 17:12:44.088473+00	\N	\N	6:00 - 8:00	t	2026-05-20 17:12:44.117585+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-20 17:12:44.117585+00	019dda81-85f0-7db5-bb97-8eb9853f4687
019e6710-a894-734d-9ecb-f87d66696418	019e04cc-c04e-772b-bf9c-fa797cf7cc38	019e309f-d28b-7c2e-880b-b88f9ef8079b	2026-05-27 01:33:25.505938+00	2026-05-27 01:37:18.939117+00	\N	7:00 AM - 8:00 AM	f	2026-05-27 01:33:25.549106+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 01:37:18.939977+00	019dda81-85f0-7db5-bb97-8eb9853f4687
019e6714-8f71-7b55-b4eb-3c32fa178e4f	019e04cc-c04e-772b-bf9c-fa797cf7cc38	019e309d-3880-7e34-a2ac-995047490a6d	2026-05-27 01:37:41.232412+00	2026-06-26 01:37:41.232413+00	\N	7:00 AM - 8:00 AM	t	2026-05-27 01:37:41.233566+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 01:37:41.233566+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- TOC entry 3620 (class 0 OID 16420)
-- Dependencies: 221
-- Data for Name: Plans; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."Plans" ("Id", "Name", "Description", "Price", "DurationInDays", "MaxBranches", "MaxMembers", "IsActive", "IsTrial", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
019dda83-b356-7f2c-898b-10ccf19c919d	Pro Tier - Monthly	Pro Tier monthly subscription plan	499.00	30	5	200	t	f	2026-04-29 18:32:37.67037+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:33:11.285579+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
019dda84-db2b-7f76-bc22-fcc66e3c64b4	Pro Tier - Yearly	Pro Tier - Yearly Subscription plan	5599.00	365	10	1000	t	f	2026-04-29 18:33:53.196362+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:33:53.196362+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
\.


--
-- TOC entry 3624 (class 0 OID 16501)
-- Dependencies: 225
-- Data for Name: RefreshTokens; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
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
019e3613-0c7a-74db-8e20-7ad7c3e7cac5	DoldEvc1slZr582iHnsWfrHsq+owuH+DQxSle3ur+J5YmnrSiYULt66u32uAiRkj9p6sn2fDgzjs2bOhN5vTqw==	2026-05-24 13:14:38.585496+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-17 13:14:38.586765+00	00000000-0000-0000-0000-000000000000	2026-05-17 13:14:38.586765+00	\N
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
019e30f4-ffa4-7d0c-8490-f2fdde32b687	9TOjGolDSrEgiXNNKMP+s/2b8OiUOBKWYUpoAPphHqzFhC8cupRSFi5hsTXwU+J1teBID999iiOzRZJc9C7PAg==	2026-05-23 13:23:42.749428+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 13:23:43.346058+00	00000000-0000-0000-0000-000000000000	2026-05-16 13:23:43.346058+00	\N
019e30d5-1d59-751d-bc59-4f9c60abd0ac	vFVgmOobOR0D4is1RaxZ3zOzzaBrZGV1w8ZBvlFnYaGD8oHf9vCXn1oQDuVMmOBZ/73wp4atlezls9CpLkZ6Lw==	2026-05-23 12:48:53.592538+00	2026-05-16 14:22:19.526071+00	2026-05-16 14:23:19.526097+00	/CKjo0jZJTbAKaBDXFFKTUJuJ6zYMd0OI3xgZZHhoDitCI+L5znyo/RIwfhR49YSRGmOenpN2XV6w3SR1WdP2Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 12:48:53.59393+00	00000000-0000-0000-0000-000000000000	2026-05-16 14:22:20.021799+00	\N
019e312a-a916-746b-8617-6bc9ae8db9d9	/CKjo0jZJTbAKaBDXFFKTUJuJ6zYMd0OI3xgZZHhoDitCI+L5znyo/RIwfhR49YSRGmOenpN2XV6w3SR1WdP2Q==	2026-05-23 14:22:19.526877+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 14:22:20.02133+00	00000000-0000-0000-0000-000000000000	2026-05-16 14:22:20.02133+00	\N
a24f01cd-16cf-4ca1-9346-14f9c9db52d6	M+NBtMcgjY10oYidO2nHOA1i7RyaEH9m/+U/71yzHVpBQqjEHB20H1yCyNIIjiOk8Hpix3tia0qHk0YwDkVQMA==	2026-05-23 17:49:15.74302+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-16 17:49:15.759532+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-16 17:49:18.047528+00	\N
019e31ed-a05f-70e6-a102-7f52baf801d7	hgiKeBAnnihnD9+mTpofuIdWA82DI/b61Pz7Czdw4ng1dkjth4TO9CMK0x9J3xon3rpK1xAAoNX9Cakwtr/hzg==	2026-05-23 17:55:17.214075+00	2026-05-17 05:11:16.933687+00	2026-05-17 05:12:16.933745+00	CzEP8T0wOQGvFrwR+hPo4RbAjrEPbAwVeB+iXfwn5Hm5ejB+pBqCdX1cVg0HPcDfgPVHM8WjaGTDLU0ZoTDPDw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-16 17:55:17.215383+00	00000000-0000-0000-0000-000000000000	2026-05-17 05:11:16.993027+00	\N
019e345f-caf9-70b2-863a-7a04c15c13b4	m4T5y3GZrSRdkzLL5xk4T28x+vvTtewxJHJE5PI9Yq4K3yhM0BmSWv3rHAaQcObOACEuiJAwTNrj8p3IP0UHGQ==	2026-05-24 05:19:13.261025+00	2026-05-17 06:01:05.064891+00	2026-05-17 06:02:05.064915+00	IpDLf9kafWQjYOvSNzF7Vr08fgKpZ4p3uoUYFNfC41HIOL/mthJR5koHVVo9LeS2RlGLCSdNwIR9xiXdqLK7PA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 05:19:13.957718+00	00000000-0000-0000-0000-000000000000	2026-05-17 06:01:05.561802+00	\N
019e3486-1eb8-7196-95ab-bbb877011823	IpDLf9kafWQjYOvSNzF7Vr08fgKpZ4p3uoUYFNfC41HIOL/mthJR5koHVVo9LeS2RlGLCSdNwIR9xiXdqLK7PA==	2026-05-24 06:01:05.065667+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 06:01:05.561248+00	00000000-0000-0000-0000-000000000000	2026-05-17 06:01:05.561248+00	\N
019e3458-84f7-753b-b873-8bfb84f612c1	CzEP8T0wOQGvFrwR+hPo4RbAjrEPbAwVeB+iXfwn5Hm5ejB+pBqCdX1cVg0HPcDfgPVHM8WjaGTDLU0ZoTDPDw==	2026-05-24 05:11:16.934671+00	2026-05-17 06:16:44.406114+00	2026-05-17 06:17:44.406115+00	56CjywdarKrhoylGCauOccyXAbHfB/ccyQvW7Q1k01d5XoeNejZcodcND6g62aKNXdrNuU2sRbixdZfdvhxylQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 05:11:16.992387+00	00000000-0000-0000-0000-000000000000	2026-05-17 06:16:44.408358+00	\N
019e3494-7278-711b-9bae-faba36fe3b6f	56CjywdarKrhoylGCauOccyXAbHfB/ccyQvW7Q1k01d5XoeNejZcodcND6g62aKNXdrNuU2sRbixdZfdvhxylQ==	2026-05-24 06:16:44.406119+00	2026-05-17 06:41:34.698193+00	2026-05-17 06:42:34.698193+00	tEeUG3465QeyxlQJ+NFXgS4ooSmw5QSglD/7O+UW4IuR+i9nYfQUqvhiuucBZQNb3ltcJX1uBQkapTCt4B+LUQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 06:16:44.408342+00	00000000-0000-0000-0000-000000000000	2026-05-17 06:41:34.698568+00	\N
019e34ab-2fea-7775-aa90-5d25a23b30bc	tEeUG3465QeyxlQJ+NFXgS4ooSmw5QSglD/7O+UW4IuR+i9nYfQUqvhiuucBZQNb3ltcJX1uBQkapTCt4B+LUQ==	2026-05-24 06:41:34.698196+00	2026-05-17 08:17:46.266795+00	2026-05-17 08:18:46.266795+00	Jo4VdjFEwjj06byQzK9/6fbmdp8E2t1xK08IoABinmxVozSFvbPwbX2/jWYJE9gSBBO461TcnlLH9vF266qj3A==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 06:41:34.698554+00	00000000-0000-0000-0000-000000000000	2026-05-17 08:17:46.267312+00	\N
019e3503-411b-7093-b592-621173557869	Jo4VdjFEwjj06byQzK9/6fbmdp8E2t1xK08IoABinmxVozSFvbPwbX2/jWYJE9gSBBO461TcnlLH9vF266qj3A==	2026-05-24 08:17:46.266799+00	2026-05-17 08:44:09.500739+00	2026-05-17 08:45:09.500739+00	IASrDMWDSRR41b19h0Ai+OTB0fXhhUqv+Wzazbz+mp+cvX4E9MtpTQYiXVebQIPz9eSz/UQen9JGE1Uxd2IMCA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 08:17:46.267298+00	00000000-0000-0000-0000-000000000000	2026-05-17 08:44:09.501183+00	\N
019e351b-699d-7e7c-a13a-c257b626a462	IASrDMWDSRR41b19h0Ai+OTB0fXhhUqv+Wzazbz+mp+cvX4E9MtpTQYiXVebQIPz9eSz/UQen9JGE1Uxd2IMCA==	2026-05-24 08:44:09.500743+00	2026-05-17 09:09:09.391155+00	2026-05-17 09:10:09.391155+00	HIG0ILYiFtPJ/fn1Bei4nGBDNm5JbFRVeVjQIuKrqUw9Uh1EwhWrHU8VyjCPbsgN33nJrEVEg+j3l2Qf8TWutg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 08:44:09.501167+00	00000000-0000-0000-0000-000000000000	2026-05-17 09:09:09.391585+00	\N
019e3532-4c8f-7c82-8042-4c25f1ee890b	HIG0ILYiFtPJ/fn1Bei4nGBDNm5JbFRVeVjQIuKrqUw9Uh1EwhWrHU8VyjCPbsgN33nJrEVEg+j3l2Qf8TWutg==	2026-05-24 09:09:09.391157+00	2026-05-17 09:33:37.376282+00	2026-05-17 09:34:37.376282+00	8vxR3LjB7HUUw4sn2ZmJso+2H9qEjbTLISePRqwJ9n8h9khKhhhZ65dO7ENGPbHdMc+bSpGtxSfhK6UftFkIWQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 09:09:09.391567+00	00000000-0000-0000-0000-000000000000	2026-05-17 09:33:37.376543+00	\N
019e3548-b2e0-7e62-b886-a2026db104e1	8vxR3LjB7HUUw4sn2ZmJso+2H9qEjbTLISePRqwJ9n8h9khKhhhZ65dO7ENGPbHdMc+bSpGtxSfhK6UftFkIWQ==	2026-05-24 09:33:37.376285+00	2026-05-17 12:05:56.240585+00	2026-05-17 12:06:56.240585+00	EnZoQsIUh22HHGsNx41wFd2fmpjHKqIbxk3zFD+i/Z6QeB8yZMwOWAAKTQtE8DrQzhSd+DkVADILHIz/9AVZVQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 09:33:37.376529+00	00000000-0000-0000-0000-000000000000	2026-05-17 12:05:56.240893+00	\N
019e35e3-38a2-7297-a28a-99acc361d84b	6FZlhqtUqUa0TZkcuv+t53CCS0BzktVag/WEXyCsFB4AaqSP57FiVj5QhhKgFJQKRxpVAoSgDICqcKUBqjJmZw==	2026-05-24 12:22:23.764667+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-17 12:22:24.458659+00	00000000-0000-0000-0000-000000000000	2026-05-17 12:22:24.458659+00	\N
019e35d4-2590-711a-a59e-946f7710c3c1	EnZoQsIUh22HHGsNx41wFd2fmpjHKqIbxk3zFD+i/Z6QeB8yZMwOWAAKTQtE8DrQzhSd+DkVADILHIz/9AVZVQ==	2026-05-24 12:05:56.24059+00	2026-05-17 12:49:14.547664+00	2026-05-17 12:50:14.547736+00	qE3WknMVQxBtqlEpGDPP1MAQWLSGHuY/G60XXmwFCQf7nJ521G/4XhgloRvjG+zTm5QjZujFKO3QmxnczQt3+A==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 12:05:56.240882+00	00000000-0000-0000-0000-000000000000	2026-05-17 12:49:14.549546+00	\N
019e35fb-cb35-7d59-bd87-217e44ac50f0	qE3WknMVQxBtqlEpGDPP1MAQWLSGHuY/G60XXmwFCQf7nJ521G/4XhgloRvjG+zTm5QjZujFKO3QmxnczQt3+A==	2026-05-24 12:49:14.547839+00	2026-05-17 13:12:21.96443+00	2026-05-17 13:13:21.964501+00	F2Ey34CD4L9FUa/zYQKgvOmSYbqYRtGmxm43kTeU83dC12WPcCakcDSX02TUnon/y5qo2f/azD8ClBi+1XuaYw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 12:49:14.549532+00	00000000-0000-0000-0000-000000000000	2026-05-17 13:12:22.042051+00	\N
019e35eb-6031-7c69-ad17-9123b7fad6ae	HI9m0EwGyf7dFLYHf2vItyQhdDCN6fSsrVcH3FSgaXzL+arlIvG5C0wCG5F5KZXvmx18Co7wUqIZ+ObRMyXyFQ==	2026-05-24 12:31:18.546105+00	2026-05-17 13:14:38.585494+00	2026-05-17 13:15:38.585494+00	DoldEvc1slZr582iHnsWfrHsq+owuH+DQxSle3ur+J5YmnrSiYULt66u32uAiRkj9p6sn2fDgzjs2bOhN5vTqw==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-17 12:31:18.596012+00	00000000-0000-0000-0000-000000000000	2026-05-17 13:14:38.586787+00	\N
019e3610-f70d-7033-95c5-b9514fd3df40	F2Ey34CD4L9FUa/zYQKgvOmSYbqYRtGmxm43kTeU83dC12WPcCakcDSX02TUnon/y5qo2f/azD8ClBi+1XuaYw==	2026-05-24 13:12:21.96635+00	2026-05-17 13:37:13.705199+00	2026-05-17 13:38:13.705248+00	kB0JDHHpmzboV85lJtNZ5dDj/VYeuUPrhQIPonwKZVclEehn3F43UNgcdnVqj1zi46qpVLl6fixMdRbfgFqWBQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 13:12:22.041241+00	00000000-0000-0000-0000-000000000000	2026-05-17 13:37:14.20885+00	\N
019e3627-bb80-7c3a-8827-297b365f2026	kB0JDHHpmzboV85lJtNZ5dDj/VYeuUPrhQIPonwKZVclEehn3F43UNgcdnVqj1zi46qpVLl6fixMdRbfgFqWBQ==	2026-05-24 13:37:13.70642+00	2026-05-17 14:19:38.488146+00	2026-05-17 14:20:38.488199+00	kM0CpbQo2iCVXzpFrjBXs30d/oCCFApsN1WK0kSkouWxZ3jAQseKrrnzQU9koVfvMMcWCUeaDwJL1qpJBRwJ+A==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 13:37:14.208313+00	00000000-0000-0000-0000-000000000000	2026-05-17 14:19:38.542534+00	\N
019e362d-6e79-7a0a-81c3-901f76435200	zQAheNJB4Bc1QUcNsPi+4c3enjFxrJ84t5MZoeDq7Gogy9+aJ0W5hShsy7CBGof7bpMjOxXR1LwioJCM+BCGlg==	2026-05-24 13:43:27.608025+00	2026-05-17 14:19:39.39742+00	2026-05-17 14:20:39.397421+00	BSAzBRac6tzyENznwYIHyjGLdd3W2TcQMAnkNxFXQRdL8MqLurT+Wbad83hOIhY0ZY9zEcqsx+sBRmTecxS+yg==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-17 13:43:27.60967+00	00000000-0000-0000-0000-000000000000	2026-05-17 14:19:39.398584+00	\N
019e364e-9206-71e3-845c-157981d08393	BSAzBRac6tzyENznwYIHyjGLdd3W2TcQMAnkNxFXQRdL8MqLurT+Wbad83hOIhY0ZY9zEcqsx+sBRmTecxS+yg==	2026-05-24 14:19:39.397435+00	2026-05-17 14:24:57.195823+00	2026-05-17 14:25:57.195913+00	HDHxbAhNj4U5XSLXo0hJqfenF8RnzZpmSd+3GBQYuq6pFvdH9Sjk1TCtpXEUp5DTnm39I3SeV9jaxkPbT5JklA==	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-17 14:19:39.398565+00	00000000-0000-0000-0000-000000000000	2026-05-17 14:24:58.091704+00	\N
019e364e-8ea5-719a-965e-282ebca7493e	kM0CpbQo2iCVXzpFrjBXs30d/oCCFApsN1WK0kSkouWxZ3jAQseKrrnzQU9koVfvMMcWCUeaDwJL1qpJBRwJ+A==	2026-05-24 14:19:38.488942+00	2026-05-17 14:24:57.285545+00	2026-05-17 14:25:57.285545+00	aHfPvdWGL2IJOSQocqgFfeqxnK9yrMsu3Kli8mSh4luUySKP0Fox0OikUQnFKefG9jGSEtAlPkaw+Vqhdp1Pkg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 14:19:38.541929+00	00000000-0000-0000-0000-000000000000	2026-05-17 14:24:58.091692+00	\N
019e3653-6e88-78b4-b958-fa24d8134825	HDHxbAhNj4U5XSLXo0hJqfenF8RnzZpmSd+3GBQYuq6pFvdH9Sjk1TCtpXEUp5DTnm39I3SeV9jaxkPbT5JklA==	2026-05-24 14:24:57.196684+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-17 14:24:58.091197+00	00000000-0000-0000-0000-000000000000	2026-05-17 14:24:58.091197+00	\N
019e3653-6e88-76a1-937d-11d6100b6447	aHfPvdWGL2IJOSQocqgFfeqxnK9yrMsu3Kli8mSh4luUySKP0Fox0OikUQnFKefG9jGSEtAlPkaw+Vqhdp1Pkg==	2026-05-24 14:24:57.285551+00	2026-05-17 14:50:36.624823+00	2026-05-17 14:51:36.624851+00	Ak/UW+J78sf/Ly8F9+QhzQxeCyaaQ5O9EcIXOZXOf6WtouqGumj70IgRJuG5zbyy+YIk2v+QakkU+NfBi3k6CQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 14:24:58.091196+00	00000000-0000-0000-0000-000000000000	2026-05-17 14:50:37.121148+00	\N
019e366a-ea5f-783f-912a-9fd200e0f2ee	Ak/UW+J78sf/Ly8F9+QhzQxeCyaaQ5O9EcIXOZXOf6WtouqGumj70IgRJuG5zbyy+YIk2v+QakkU+NfBi3k6CQ==	2026-05-24 14:50:36.625617+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 14:50:37.120606+00	00000000-0000-0000-0000-000000000000	2026-05-17 14:50:37.120606+00	\N
019e3672-ec45-7713-9be8-54e2e4651a6d	hdU9RMjUzXJpaA2hk80wwTIncI5iXngAPHGZKbl4AkHy3lZKBDZHUURjNwi5qqy8WNr/z2ia9+1bKYhLcShPNg==	2026-05-24 14:59:21.76202+00	2026-05-17 15:20:02.390445+00	2026-05-17 15:21:02.390513+00	H7EZWPjzy8B7dbnrpnbjom3YeVdSuT6z6+nLEuwvGuBSDdL4uZdgQPJlP0rO3b3HvAP9n9I8Dg1lZOzE5r6KZg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 14:59:21.824994+00	00000000-0000-0000-0000-000000000000	2026-05-17 15:20:02.39264+00	\N
019e3693-13ec-77ae-9be9-8f358799818e	PrtdtyySyHKgWn3aDYu/1A+vGKa1i/NGpF0G70637j/9eJM6Gslib4a+oS6Wnm7MBzMdYUnw7njes6ZQOS+VxA==	2026-05-24 15:34:29.100817+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-17 15:34:29.101082+00	00000000-0000-0000-0000-000000000000	2026-05-17 15:34:29.101082+00	\N
019e3693-6c1e-7845-9f0c-7bf3bb487b97	S+OIjiC4vNbT+FjnGiIAeg2XOkDO8naQf+AezC4VIe+b6PdFuODuaWIlIss2ATPEgLgymiyrv0tLKTfWDRztvA==	2026-05-24 15:34:51.287358+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-17 15:34:51.889375+00	00000000-0000-0000-0000-000000000000	2026-05-17 15:34:51.889375+00	\N
019e3685-da58-7314-8f2e-233a97bb7a22	H7EZWPjzy8B7dbnrpnbjom3YeVdSuT6z6+nLEuwvGuBSDdL4uZdgQPJlP0rO3b3HvAP9n9I8Dg1lZOzE5r6KZg==	2026-05-24 15:20:02.390629+00	2026-05-17 16:01:06.749129+00	2026-05-17 16:02:06.74913+00	gJ1QwDPIXQ75OcT9+IhbU9iyCivmmYB8Us5IffkU1lzdggZ5k2+4/Odg8SuXI6cdQNWs/J8toKWi5U/dR4JCqg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 15:20:02.392626+00	00000000-0000-0000-0000-000000000000	2026-05-17 16:01:06.749739+00	\N
019e36ab-74bd-7156-a5c0-13fb72d2bbc5	gJ1QwDPIXQ75OcT9+IhbU9iyCivmmYB8Us5IffkU1lzdggZ5k2+4/Odg8SuXI6cdQNWs/J8toKWi5U/dR4JCqg==	2026-05-24 16:01:06.749134+00	2026-05-17 16:35:40.456839+00	2026-05-17 16:36:40.456839+00	cZXqv/Gx3lxK9A/2JQnBknRXoZAh+lGv4tCoWteDc7fP37r010nZXogwOhdhpedFUuDSVAKMI37bst9U8JKEQw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 16:01:06.749716+00	00000000-0000-0000-0000-000000000000	2026-05-17 16:35:40.457081+00	\N
019e36cb-1929-7110-8e57-0b6edb31fc41	cZXqv/Gx3lxK9A/2JQnBknRXoZAh+lGv4tCoWteDc7fP37r010nZXogwOhdhpedFUuDSVAKMI37bst9U8JKEQw==	2026-05-24 16:35:40.456841+00	2026-05-17 17:17:41.810734+00	2026-05-17 17:18:41.810734+00	CBMnALetfrNS60UlALppeLqvqZea8F6cGXZVnA7bcocHYl1cPFcDRcni5ebKhI3mREGVnFbpJq92lQNnRsQQQg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 16:35:40.457067+00	00000000-0000-0000-0000-000000000000	2026-05-17 17:17:41.811353+00	\N
019e36f1-9233-7d65-b1b5-68a3570a10a7	CBMnALetfrNS60UlALppeLqvqZea8F6cGXZVnA7bcocHYl1cPFcDRcni5ebKhI3mREGVnFbpJq92lQNnRsQQQg==	2026-05-24 17:17:41.810737+00	2026-05-17 17:41:04.857423+00	2026-05-17 17:42:04.857478+00	KSE23hSkKdGJk0fSjA1tR7PllhTa8tduPUN0ODnpQKKINFsvkr9nPYyGb9NPZp5bkUcQUjsbROJLJnc/jo65BA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 17:17:41.81132+00	00000000-0000-0000-0000-000000000000	2026-05-17 17:41:04.908843+00	\N
019e3706-fb04-78ca-a294-5c16e81f68dd	KSE23hSkKdGJk0fSjA1tR7PllhTa8tduPUN0ODnpQKKINFsvkr9nPYyGb9NPZp5bkUcQUjsbROJLJnc/jo65BA==	2026-05-24 17:41:04.858229+00	2026-05-17 18:01:53.541323+00	2026-05-17 18:02:53.541387+00	/UUqiLThTHZINnyFzpAs6nAct7paEyFa6vXN5XIM3GprIT2HfI+D0l98JwMpfsA3/s8pqPbjjX82942J0kqeIw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 17:41:04.908545+00	00000000-0000-0000-0000-000000000000	2026-05-17 18:01:53.602112+00	\N
019e372b-04de-7431-bf75-3af5ed17eb5e	7Zz5GRLjmeaGDm3SILu3ZkR7L+rSI3EUlm+0MfytF6a/tG35O+YlmCN5O9tG7SrrywroRh4Y1gAfge8nVSkOhg==	2026-05-24 18:20:26.71149+00	2026-05-18 15:34:09.527168+00	2026-05-18 15:35:09.527252+00	LyQoePHbYVnCzTx4I6G8Yds8F2HC3LLw+YCZGbqkoT7ZIgDlipxHTRnKY9xB1FbzW0zhYW+QgzeJjGlqLxdOmg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-17 18:20:26.722764+00	00000000-0000-0000-0000-000000000000	2026-05-18 15:34:09.594741+00	\N
019e3bb9-23af-73b1-a92f-021831e0edd6	LyQoePHbYVnCzTx4I6G8Yds8F2HC3LLw+YCZGbqkoT7ZIgDlipxHTRnKY9xB1FbzW0zhYW+QgzeJjGlqLxdOmg==	2026-05-25 15:34:09.52835+00	2026-05-18 16:01:27.784482+00	2026-05-18 16:02:27.784482+00	8t6w2gFLxZ8C2qssDigv6o7EAOM6Z1/96JKt1lKOly5MRjhB7Z1aeuh8I5nQgjOB8Tcd3R8np2B3qJl7dCLazg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-18 15:34:09.594269+00	00000000-0000-0000-0000-000000000000	2026-05-18 16:01:27.786282+00	\N
019e3bd3-1df7-7d1f-8dd7-5983fd81bdfc	AqHcT+Xb6SPpSYIg77RqNhkjoL3gYFO8fOn4CWKWu6AEl6HLNkpyIVTPT+EbAv+xmjbk2OhtqHTkUymTeJVyeQ==	2026-05-25 16:02:32.054982+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-18 16:02:32.055224+00	00000000-0000-0000-0000-000000000000	2026-05-18 16:02:32.055224+00	\N
019e3bd2-da2a-7f7f-8abe-d52323702be2	v8OSidwExxArprCrhU2hyVSh9DJ2Gy6gXXzng7oxerO1Y+KItegLA3/7Ium2KS3ZrLG7uG9v+vhNLkz98LjYTg==	2026-05-25 16:02:14.698591+00	2026-05-18 16:55:11.40211+00	2026-05-18 16:56:11.402184+00	ptOIT6e60Mks4Joe8v5rW1i6M/ufJeCZO/XyDVqYz5HR/EzoSnzrvEelIDLp6JXq1l6sY1yW8SVAQc/UNM03fQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-18 16:02:14.698887+00	00000000-0000-0000-0000-000000000000	2026-05-18 16:55:11.476712+00	\N
019e3c03-5368-723c-9c89-879d4a27069b	ptOIT6e60Mks4Joe8v5rW1i6M/ufJeCZO/XyDVqYz5HR/EzoSnzrvEelIDLp6JXq1l6sY1yW8SVAQc/UNM03fQ==	2026-05-25 16:55:11.403086+00	2026-05-18 17:17:54.48667+00	2026-05-18 17:18:54.486756+00	N5Hhys2LCNtorbd710Gc5wvddYYnmkHlhtSA/vEQZoF74A0o/7IdjZeEqiKv3MWPTOMtY9ikEXyhfJ0f771POw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-18 16:55:11.475906+00	00000000-0000-0000-0000-000000000000	2026-05-18 17:17:54.515096+00	\N
019e3eff-49d1-7f95-aefd-11adaeb6f70d	FjtOJSPWzR6slBNIi/tu8SfL9rb+4lO7KBUe8oZk2V/k2QgI6DFlCrIyMYMiiZ3vyjBAo3+oYcj9ReTTVwaANw==	2026-05-26 06:49:38.109514+00	2026-05-19 07:25:09.436986+00	2026-05-19 07:26:09.437038+00	OObf85gT+5bsZQIwqRUHpvW+lZUiuGPLBGeiqhsQ3RjSLEV4Rn+Nv00to9jOVqiEU9MxkoIxh6z1kLzGSbxClA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-19 06:49:38.808258+00	00000000-0000-0000-0000-000000000000	2026-05-19 07:25:09.939373+00	\N
019e3c18-1fcd-76f1-81c8-4719e87e09e8	N5Hhys2LCNtorbd710Gc5wvddYYnmkHlhtSA/vEQZoF74A0o/7IdjZeEqiKv3MWPTOMtY9ikEXyhfJ0f771POw==	2026-05-25 17:17:54.487705+00	2026-05-20 16:41:16.967928+00	2026-05-20 16:42:16.967999+00	2iMbCK0WaxdEskshjEZ8G8yiaIlPnPXnoMHFkzTGdgVOnG358t9f1mTaV07loLJSE/GjeaKs7e+E4W/ASH4TKQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-18 17:17:54.515074+00	00000000-0000-0000-0000-000000000000	2026-05-20 16:41:17.029905+00	\N
019e4643-4fdb-7e57-b731-289fc370cbb7	2iMbCK0WaxdEskshjEZ8G8yiaIlPnPXnoMHFkzTGdgVOnG358t9f1mTaV07loLJSE/GjeaKs7e+E4W/ASH4TKQ==	2026-05-27 16:41:16.969056+00	2026-05-20 17:01:16.709447+00	2026-05-20 17:02:16.709447+00	BMp1obOBP8LKV9D19jRy2jTj/osfJlFQqO3HN6W1saVpF/E7ICAd/CCR6LbtBLCvhSvfrG+6u/MIK8nRlvkQjQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-20 16:41:17.029116+00	00000000-0000-0000-0000-000000000000	2026-05-20 17:01:16.710739+00	\N
019e4655-9e26-75d9-a40f-79a20940d2c7	BMp1obOBP8LKV9D19jRy2jTj/osfJlFQqO3HN6W1saVpF/E7ICAd/CCR6LbtBLCvhSvfrG+6u/MIK8nRlvkQjQ==	2026-05-27 17:01:16.70945+00	2026-05-21 01:50:04.487509+00	2026-05-21 01:51:04.487562+00	sl2tbV7ny9gRKAUDo9ZlkovDj8ziZdiO8G5uTRKg7ssxKy09cz+g/SxM3gLSiyOzh0Iz1h3Rcashcnv/+geu6A==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-20 17:01:16.710721+00	00000000-0000-0000-0000-000000000000	2026-05-21 01:50:04.545944+00	\N
019e3f1f-cfa7-7733-a225-ebd48c35f58c	OObf85gT+5bsZQIwqRUHpvW+lZUiuGPLBGeiqhsQ3RjSLEV4Rn+Nv00to9jOVqiEU9MxkoIxh6z1kLzGSbxClA==	2026-05-26 07:25:09.438307+00	2026-05-21 06:13:12.493699+00	2026-05-21 06:14:12.493743+00	otxsu6/5k3uxRN02RFQTlAp8ys4YhZ6F3BUfz9LZ8a0aFf1QQIpNAf6TvrEZOYa/vAcEMmzcEOqaP6X7SgWdiA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-19 07:25:09.938702+00	00000000-0000-0000-0000-000000000000	2026-05-21 06:13:13.086243+00	\N
019e4839-bef7-708b-b9f5-62166bbabdcc	sl2tbV7ny9gRKAUDo9ZlkovDj8ziZdiO8G5uTRKg7ssxKy09cz+g/SxM3gLSiyOzh0Iz1h3Rcashcnv/+geu6A==	2026-05-28 01:50:04.488388+00	2026-05-21 01:58:06.455968+00	2026-05-21 01:59:06.456042+00	ppJh+5LRzo4/sTfH3KAKLoSpQfunkp2/SdngjEc46PXeAh2jDV5N0b0fKRqLYYMPVpAao9QGNLOa93u9G0OUaQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-21 01:50:04.545271+00	00000000-0000-0000-0000-000000000000	2026-05-21 01:58:06.953867+00	\N
019e4841-1b09-7b4d-8db4-c169f3e03589	ppJh+5LRzo4/sTfH3KAKLoSpQfunkp2/SdngjEc46PXeAh2jDV5N0b0fKRqLYYMPVpAao9QGNLOa93u9G0OUaQ==	2026-05-28 01:58:06.456842+00	2026-05-21 02:23:19.266428+00	2026-05-21 02:24:19.266462+00	9rtSTDOJvOIcWiY7MEQL4SucbvJ51OCjUeu6ywTaUO2f2F9xiU0rrKzP189J/f3SxajcFAfTRwkaR9QekZF6kA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-21 01:58:06.95324+00	00000000-0000-0000-0000-000000000000	2026-05-21 02:23:19.674097+00	\N
019e4858-306f-7a00-869a-352c762cf24c	9rtSTDOJvOIcWiY7MEQL4SucbvJ51OCjUeu6ywTaUO2f2F9xiU0rrKzP189J/f3SxajcFAfTRwkaR9QekZF6kA==	2026-05-28 02:23:19.267388+00	2026-05-21 03:28:48.370878+00	2026-05-21 03:29:48.370936+00	RpLHfXKeRcN2AAdrl1apl7MBMxsKYuYRyLLrTqXbrf/mxyS/i66krqZWJQwRn+03SfE9o7bPVkNJFOVWfKMPWQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-21 02:23:19.673838+00	00000000-0000-0000-0000-000000000000	2026-05-21 03:28:48.427445+00	\N
019e4646-0ac9-7ef9-9768-a8ab35cc9c33	qI5Nbk10BkJOFUi/K9DWudHaUc3Nkr8AHP651u0OWlV+g99fHJf88ihmtyaN4eUMDPTdtyrUpQ4CtpgHTo+8kg==	2026-05-27 16:44:15.549855+00	2026-05-22 02:05:13.614894+00	2026-05-22 02:06:13.614936+00	9g0F46BFkAvPdsD7ECKn9fuFpQezX9rcdRKb9vxnwFa8JmE/bnayTYDcBNEik6zg5ezpG4hXSHsaOR0bFsvBbA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-20 16:44:16.14993+00	00000000-0000-0000-0000-000000000000	2026-05-22 02:05:14.21195+00	\N
019e4894-2322-7488-831c-a380f51c5869	RpLHfXKeRcN2AAdrl1apl7MBMxsKYuYRyLLrTqXbrf/mxyS/i66krqZWJQwRn+03SfE9o7bPVkNJFOVWfKMPWQ==	2026-05-28 03:28:48.371708+00	2026-05-22 02:06:21.188989+00	2026-05-22 02:07:21.188989+00	n8KM8YTvvibfgz22YUH9zcwET5mze8ZZmKB7K7eg4dJrzunNQvzr3YB/frAgYIwwtzftia0e48RYPzaKH8I6cg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-21 03:28:48.42663+00	00000000-0000-0000-0000-000000000000	2026-05-22 02:06:21.190666+00	\N
019e4d6f-0206-7afe-bfdb-6981f46e32a5	n8KM8YTvvibfgz22YUH9zcwET5mze8ZZmKB7K7eg4dJrzunNQvzr3YB/frAgYIwwtzftia0e48RYPzaKH8I6cg==	2026-05-29 02:06:21.188992+00	2026-05-22 02:28:41.020756+00	2026-05-22 02:29:41.020813+00	mD+mmpFSsTBPtxtrQjBXQWJ+zCtPbvixPQn7xo3tkTcmHy3xhThAPCV4GKC+G+ati8qrvSAlL543YnJufKUhBA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-22 02:06:21.190642+00	00000000-0000-0000-0000-000000000000	2026-05-22 02:28:41.085092+00	\N
019e4d83-73f2-70e6-aef1-9b75fe271ea2	mD+mmpFSsTBPtxtrQjBXQWJ+zCtPbvixPQn7xo3tkTcmHy3xhThAPCV4GKC+G+ati8qrvSAlL543YnJufKUhBA==	2026-05-29 02:28:41.0217+00	2026-05-22 03:18:19.253341+00	2026-05-22 03:19:19.253438+00	ZOaivls1hj14T6sGD8R/tCIPVwDqnCtdZ+DSYknYhACetT02vqgmbPIvlnUJlHr1VEFZWmY0TM+WH7aNSOjZPQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-22 02:28:41.084354+00	00000000-0000-0000-0000-000000000000	2026-05-22 03:18:19.292668+00	\N
019e4db0-e594-7cc4-a221-82cf429c9fbe	ZOaivls1hj14T6sGD8R/tCIPVwDqnCtdZ+DSYknYhACetT02vqgmbPIvlnUJlHr1VEFZWmY0TM+WH7aNSOjZPQ==	2026-05-29 03:18:19.254971+00	2026-05-22 19:46:29.496983+00	2026-05-22 19:47:29.497042+00	Hcewm9K5wtyjtIlFm0hoDWCRkQfyeejPsaSSA6IFckJW3ZtkkJl/fsgaCeKsWSD98Es+HuSjYp3QwpvD5vCQ6g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-22 03:18:19.292638+00	00000000-0000-0000-0000-000000000000	2026-05-22 19:46:29.555393+00	\N
019e5139-982a-7e02-8538-0826b8cf1081	Hcewm9K5wtyjtIlFm0hoDWCRkQfyeejPsaSSA6IFckJW3ZtkkJl/fsgaCeKsWSD98Es+HuSjYp3QwpvD5vCQ6g==	2026-05-29 19:46:29.497924+00	2026-05-23 02:06:27.365425+00	2026-05-23 02:07:27.365477+00	ysgA30ReJKKQlulQ+fc+YhiAqKOgLmx10bT4blB1nVMQAxTlkGFK/r2L4LDX38aw+tOHaCniKngxp8ie/FGhSw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-22 19:46:29.55482+00	00000000-0000-0000-0000-000000000000	2026-05-23 02:06:27.424715+00	\N
019e5295-7657-7ae2-b354-3ff40a24ce77	ysgA30ReJKKQlulQ+fc+YhiAqKOgLmx10bT4blB1nVMQAxTlkGFK/r2L4LDX38aw+tOHaCniKngxp8ie/FGhSw==	2026-05-30 02:06:27.366274+00	2026-05-23 02:26:37.106781+00	2026-05-23 02:27:37.106781+00	DkNT/SE5+W+Zmu5UJt4T4T+Fxp3LSbcobAB8xTmb2SSMYDzy9OrrEApUGIbNfhgvxS7gLNgv1+yHgKig7IQjJA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 02:06:27.424082+00	00000000-0000-0000-0000-000000000000	2026-05-23 02:26:37.108453+00	\N
019e52a7-ebb4-735a-b5e3-bea75e90ee52	DkNT/SE5+W+Zmu5UJt4T4T+Fxp3LSbcobAB8xTmb2SSMYDzy9OrrEApUGIbNfhgvxS7gLNgv1+yHgKig7IQjJA==	2026-05-30 02:26:37.106783+00	2026-05-23 02:47:07.591259+00	2026-05-23 02:48:07.591259+00	yfddD0M7PCANcT770rQCPf8APc0YHWAZL1vEkz30mAl58kPMOT9zsnR4XpzX3iirD6rDkw7FY0bhd1hSOk4Pxw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 02:26:37.108429+00	00000000-0000-0000-0000-000000000000	2026-05-23 02:47:07.591528+00	\N
019e52ba-b247-78f5-bb98-5c7f6a4900b8	yfddD0M7PCANcT770rQCPf8APc0YHWAZL1vEkz30mAl58kPMOT9zsnR4XpzX3iirD6rDkw7FY0bhd1hSOk4Pxw==	2026-05-30 02:47:07.591263+00	2026-05-23 03:07:13.752995+00	2026-05-23 03:08:13.752996+00	hwn8E6B5/v6BDtd6ZvEITKvVBn4fVx9mq+ipzx6PIjECXotTb9YzdMy6VuKIW+vfh+vjOh+oTCB+QlkFZhY15g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 02:47:07.591515+00	00000000-0000-0000-0000-000000000000	2026-05-23 03:07:13.753288+00	\N
019e52cd-19d9-7ee1-86fa-750b23177725	hwn8E6B5/v6BDtd6ZvEITKvVBn4fVx9mq+ipzx6PIjECXotTb9YzdMy6VuKIW+vfh+vjOh+oTCB+QlkFZhY15g==	2026-05-30 03:07:13.752997+00	2026-05-23 04:39:41.558071+00	2026-05-23 04:40:41.558071+00	N8N9Z8FQyAVspgllCFJK7BW9wWm0cc8nuD9ikZt4m50DTBBDLqqx5gQPkUZNWEczJwCvS1bpoXUwpfwigINgkw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 03:07:13.753276+00	00000000-0000-0000-0000-000000000000	2026-05-23 04:39:41.558339+00	\N
019e532b-2cbd-7051-a816-1cde114c08d5	MHIG0lxDEUWSwkD3KB7NKp4U9s44RY9LntNIOPtftHBuovK6LCPBHCPVne0W0o+KOc3nv7mUp9/80m+CvUkVjQ==	2026-05-30 04:49:58.973299+00	2026-05-23 05:12:23.171463+00	2026-05-23 05:13:23.171463+00	eyDYotm3nzdpWQN/e1EBL7oPGGXx2iSMg71c3xnXVkzO2uu5EwfZ15rXHKL2Lwt+Fw9YgF+VnOABy5w/BvLJoQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 04:49:58.973546+00	00000000-0000-0000-0000-000000000000	2026-05-23 05:12:23.172174+00	\N
019e533f-af84-7a7f-a523-c0c774783587	eyDYotm3nzdpWQN/e1EBL7oPGGXx2iSMg71c3xnXVkzO2uu5EwfZ15rXHKL2Lwt+Fw9YgF+VnOABy5w/BvLJoQ==	2026-05-30 05:12:23.171468+00	2026-05-23 05:33:27.630658+00	2026-05-23 05:34:27.6307+00	/0pLe8lM5SV5JYxikDzFFeGmw19cER6lSRxJ+MniFrpq/DgSMgL+7Zcyxoufti1Ii7C7ZJ+v7gg34MeaSCga2Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 05:12:23.17216+00	00000000-0000-0000-0000-000000000000	2026-05-23 05:33:27.689551+00	\N
019e5352-fb00-7479-8dcd-7442037ce8f4	/0pLe8lM5SV5JYxikDzFFeGmw19cER6lSRxJ+MniFrpq/DgSMgL+7Zcyxoufti1Ii7C7ZJ+v7gg34MeaSCga2Q==	2026-05-30 05:33:27.631568+00	2026-05-23 06:04:58.658211+00	2026-05-23 06:05:58.658211+00	AlccBDWPvVBxYIWGsCSMjJtauRSMsjoYX+GttaXiCM9cSOTsJjHbhFQeEexNohMPc7WDmhHA9ZMqzZ+y5kS4DQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 05:33:27.689157+00	00000000-0000-0000-0000-000000000000	2026-05-23 06:04:58.659513+00	\N
019e536f-d5a3-7e09-8a0a-3bb696ccf176	AlccBDWPvVBxYIWGsCSMjJtauRSMsjoYX+GttaXiCM9cSOTsJjHbhFQeEexNohMPc7WDmhHA9ZMqzZ+y5kS4DQ==	2026-05-30 06:04:58.658214+00	2026-05-23 06:32:22.356886+00	2026-05-23 06:33:22.356927+00	2UN9d+iwC1DQ1vyoEnz/tTNcWRsICGt7C7yqEU4RbxgFftWBnlMwpqb/TzWEgnM3KSibSgaE+hdEY1f+BZ49lQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 06:04:58.659493+00	00000000-0000-0000-0000-000000000000	2026-05-23 06:32:22.410891+00	\N
019e5388-ea81-7603-9ad6-9aa26c8c467f	2UN9d+iwC1DQ1vyoEnz/tTNcWRsICGt7C7yqEU4RbxgFftWBnlMwpqb/TzWEgnM3KSibSgaE+hdEY1f+BZ49lQ==	2026-05-30 06:32:22.357606+00	2026-05-23 07:04:17.006681+00	2026-05-23 07:05:17.006681+00	4lCRzzpLYpYXQcRhABGyQSh4s89an5Kl/gAaN30CiEFWPrI6VZzuir42F/ZwBIvijP0syuL+FwkPD5/NzHOFVw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 06:32:22.410309+00	00000000-0000-0000-0000-000000000000	2026-05-23 07:04:17.006928+00	\N
019e4d6d-fc01-7e8b-a07e-fb40a20255a6	9g0F46BFkAvPdsD7ECKn9fuFpQezX9rcdRKb9vxnwFa8JmE/bnayTYDcBNEik6zg5ezpG4hXSHsaOR0bFsvBbA==	2026-05-29 02:05:13.615923+00	2026-05-23 07:07:10.619949+00	2026-05-23 07:08:10.619983+00	WUXxHG8tXbHG0lbgPQRJJ8vgk/5hIdqz9FeMk5tumdbWQgmC9wGuhiM+u6UaBuZi68paJ/Is3g3yddejkbbqYQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-22 02:05:14.211366+00	00000000-0000-0000-0000-000000000000	2026-05-23 07:07:11.124363+00	\N
019e539b-e88d-731b-bdb4-ee1dd4b0f20c	7CzR82h3oBpt+jhKWETwWSjML6ss1hH3qw4n8CC+vVRcNe+ZWGfeKhWKGsComnv+kUg2AXqXfFc2uPj5b4AsPA==	2026-05-30 06:53:07.082519+00	2026-05-23 07:25:43.01252+00	2026-05-23 07:26:43.01252+00	BL3XxFoq91NY5RAv73ikwHp5vkWx2dmNtPOIU7JQUMvhdU8qrkfRkHOnAv+wGNeMP154hluwaGttbv6+zxUttw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 06:53:07.085671+00	00000000-0000-0000-0000-000000000000	2026-05-23 07:25:43.012745+00	\N
019e53a6-216e-771c-bbc2-26b6736e279d	4lCRzzpLYpYXQcRhABGyQSh4s89an5Kl/gAaN30CiEFWPrI6VZzuir42F/ZwBIvijP0syuL+FwkPD5/NzHOFVw==	2026-05-30 07:04:17.006683+00	2026-05-23 07:25:43.007927+00	2026-05-23 07:26:43.007927+00	OsqXDgNQKJveW3AJIRt0FS5exueA09bh7hRAowgeUo1W5f1Mpn6F8vDoMTUe+ySjf/y/Y1SIemR2oX7Aq61EFw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 07:04:17.006914+00	00000000-0000-0000-0000-000000000000	2026-05-23 07:25:43.00887+00	\N
019e53b9-c0e0-785c-abab-644d1d436fbf	OsqXDgNQKJveW3AJIRt0FS5exueA09bh7hRAowgeUo1W5f1Mpn6F8vDoMTUe+ySjf/y/Y1SIemR2oX7Aq61EFw==	2026-05-30 07:25:43.007929+00	2026-05-23 07:49:58.950585+00	2026-05-23 07:50:58.950678+00	3GOS0w+XsQHk0lj0fIcfPK+0aBXxab6zzeMQB1QR01jngIWKt0BU/96SrHmxtv8NMPo3wyNgJHNmUOIBNc/ZjA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 07:25:43.008858+00	00000000-0000-0000-0000-000000000000	2026-05-23 07:49:59.007774+00	\N
019e53a8-c932-7272-ad73-a28691d488da	WUXxHG8tXbHG0lbgPQRJJ8vgk/5hIdqz9FeMk5tumdbWQgmC9wGuhiM+u6UaBuZi68paJ/Is3g3yddejkbbqYQ==	2026-05-30 07:07:10.620924+00	2026-05-23 12:27:28.759845+00	2026-05-23 12:28:28.759888+00	2aK46baR4yZFx8FmP6GXTdDXAjN46goz12lhZIC5ijRR/qjFyXxF41EWLn5oTUZCSRrgQa93TFsdq37sC4SOeQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 07:07:11.123764+00	00000000-0000-0000-0000-000000000000	2026-05-23 12:27:29.275982+00	\N
019e53b9-c0e4-7d79-ad81-efcca419ebab	BL3XxFoq91NY5RAv73ikwHp5vkWx2dmNtPOIU7JQUMvhdU8qrkfRkHOnAv+wGNeMP154hluwaGttbv6+zxUttw==	2026-05-30 07:25:43.012523+00	2026-05-23 13:50:43.460957+00	2026-05-23 13:51:43.460957+00	bai6SgOngjZtL+72ybtQdr4uiGWqaGkmksUScO5NPLWW1UpAU3FNU0B8Qn0jGbFEaBRrYzr5cVm41gRnhVPRfw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 07:25:43.012731+00	00000000-0000-0000-0000-000000000000	2026-05-23 13:50:43.461279+00	\N
019e53cf-f856-7963-acc8-3e86684531eb	3GOS0w+XsQHk0lj0fIcfPK+0aBXxab6zzeMQB1QR01jngIWKt0BU/96SrHmxtv8NMPo3wyNgJHNmUOIBNc/ZjA==	2026-05-30 07:49:58.951631+00	2026-05-23 08:18:41.867951+00	2026-05-23 08:19:41.867995+00	LNOGXyHpmOn16d9kAg1JnjCIxe+m489fQLToyKcHj570qJOtBPOmkFL21ZH49hAiLlvFz5OWUaHvFzJx/KDAPw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 07:49:59.007321+00	00000000-0000-0000-0000-000000000000	2026-05-23 08:18:41.927128+00	\N
019e5075-ec9d-7e2b-9d59-5c3910eff1a5	auuFhdcNcirbwaTnZ2XIncuQnngOfP0GyqL1xn39ChcBpw6XTsKQKjl94FTLlInQ9j8QGPfzxhRWaKYttYz8MQ==	2026-05-29 16:12:45.619991+00	2026-05-23 09:02:12.691325+00	2026-05-23 09:03:12.691373+00	iCDVggdDke8NrHRxSvAA5dcHQ81boUpv6zlFpJn7H9CNwZjH2AGBUhJlKmRPRi+mFK/W/d/yTomukYECJqYUvg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-22 16:12:46.416012+00	00000000-0000-0000-0000-000000000000	2026-05-23 09:02:13.290514+00	\N
019e5412-1acb-7527-94e3-505938f8cc83	iCDVggdDke8NrHRxSvAA5dcHQ81boUpv6zlFpJn7H9CNwZjH2AGBUhJlKmRPRi+mFK/W/d/yTomukYECJqYUvg==	2026-05-30 09:02:12.692677+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 09:02:13.289914+00	00000000-0000-0000-0000-000000000000	2026-05-23 09:02:13.289914+00	\N
019e53ea-427d-7de0-b550-f45c48fed37b	LNOGXyHpmOn16d9kAg1JnjCIxe+m489fQLToyKcHj570qJOtBPOmkFL21ZH49hAiLlvFz5OWUaHvFzJx/KDAPw==	2026-05-30 08:18:41.868751+00	2026-05-23 10:16:45.008446+00	2026-05-23 10:17:45.008561+00	VQopn4UGdo3IIzqIFvAozHqQQ3e2yg/nONXGqcoqb20V5Kzzwca3j9g6ILONvMgUv2chARShRsfsZTihcIAJsg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 08:18:41.926488+00	00000000-0000-0000-0000-000000000000	2026-05-23 10:16:45.078106+00	\N
019e5456-570a-7d22-a9b2-5427dd56927c	VQopn4UGdo3IIzqIFvAozHqQQ3e2yg/nONXGqcoqb20V5Kzzwca3j9g6ILONvMgUv2chARShRsfsZTihcIAJsg==	2026-05-30 10:16:45.009464+00	2026-05-23 11:19:11.455871+00	2026-05-23 11:20:11.455872+00	6zesbYQmCl0WTEgKxDDskR261C3q91flff9VR4QSFSwmD9lXMw+XqhZpE80ktSfeRY/Ox/2fxzrAJ3YnBWFU1g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 10:16:45.077672+00	00000000-0000-0000-0000-000000000000	2026-05-23 11:19:11.457044+00	\N
019e548f-8160-7a81-ab0c-ba0e0a3c9a36	6zesbYQmCl0WTEgKxDDskR261C3q91flff9VR4QSFSwmD9lXMw+XqhZpE80ktSfeRY/Ox/2fxzrAJ3YnBWFU1g==	2026-05-30 11:19:11.455874+00	2026-05-23 11:40:57.997925+00	2026-05-23 11:41:57.997925+00	mtiTdg0+iVJy8ccZkfrCj385/+tI53fsOZ5iTsovSRIkguq3x78jSkJKTw0qo3vOkeuNAhKMVyPAsIGS2tnAmw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 11:19:11.457031+00	00000000-0000-0000-0000-000000000000	2026-05-23 11:40:57.999205+00	\N
019e54a3-710e-737b-a525-50737d233591	mtiTdg0+iVJy8ccZkfrCj385/+tI53fsOZ5iTsovSRIkguq3x78jSkJKTw0qo3vOkeuNAhKMVyPAsIGS2tnAmw==	2026-05-30 11:40:57.99793+00	2026-05-23 12:25:54.967801+00	2026-05-23 12:26:54.967851+00	UZkfgx5db/k157bjybJDu8snDPcr2Raw2awGHL0MpG/mlqrFyLDwuPV0iZarRYtuG/zf60MVpjqxQ13vhEUHtw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 11:40:57.999147+00	00000000-0000-0000-0000-000000000000	2026-05-23 12:25:55.030707+00	\N
019e54cc-984c-728c-979b-598b5b438aa7	UZkfgx5db/k157bjybJDu8snDPcr2Raw2awGHL0MpG/mlqrFyLDwuPV0iZarRYtuG/zf60MVpjqxQ13vhEUHtw==	2026-05-30 12:25:54.968639+00	2026-05-23 12:48:58.17254+00	2026-05-23 12:49:58.172621+00	lsUjNoVE7ihBOwA7i38EuO3WK175dj/XqomkmLDvflT4ckQu4orl/On54iDAkwZ7K6mPbKq3z2xM0DE1mEx3+g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 12:25:55.030334+00	00000000-0000-0000-0000-000000000000	2026-05-23 12:48:58.235911+00	\N
019e54ce-086c-73ee-ae62-f92e6d081a1f	2aK46baR4yZFx8FmP6GXTdDXAjN46goz12lhZIC5ijRR/qjFyXxF41EWLn5oTUZCSRrgQa93TFsdq37sC4SOeQ==	2026-05-30 12:27:28.761219+00	2026-05-23 13:06:05.771698+00	2026-05-23 13:07:05.771739+00	IrODcDbQKvuQrQtdFxKEXBQd/F4kSuLkf9S374NkrfnozXfuHVjD5bft5kRMMqMTEaO+co5Mmkfiy/Mfrrp9Bg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 12:27:29.275444+00	00000000-0000-0000-0000-000000000000	2026-05-23 13:06:06.275589+00	\N
019e54e1-b371-7827-bcd2-7a4694577182	lsUjNoVE7ihBOwA7i38EuO3WK175dj/XqomkmLDvflT4ckQu4orl/On54iDAkwZ7K6mPbKq3z2xM0DE1mEx3+g==	2026-05-30 12:48:58.17361+00	2026-05-23 13:09:09.328185+00	2026-05-23 13:10:09.328185+00	9YaHJMnC/MPfuPBJpl/vIFkNg7GMvxXM8+1D3pK4h3QFYUVbJBK7YuoRNKWXzSLLUo9gzVKhC2dW2I/Sf+e9rA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 12:48:58.235116+00	00000000-0000-0000-0000-000000000000	2026-05-23 13:09:09.329784+00	\N
019e54f4-2e51-76f1-9d02-dbf5d373a60f	9YaHJMnC/MPfuPBJpl/vIFkNg7GMvxXM8+1D3pK4h3QFYUVbJBK7YuoRNKWXzSLLUo9gzVKhC2dW2I/Sf+e9rA==	2026-05-30 13:09:09.328206+00	2026-05-23 13:48:41.252671+00	2026-05-23 13:49:41.252672+00	yCG5GonjoRuYF0mbd6EajKHCnSnY2nIv1P4SUTZX1YZQYm2fDEmFRFVrh1fo9kCz+qyXKXYP5ccjBx7wLT7m3A==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 13:09:09.329767+00	00000000-0000-0000-0000-000000000000	2026-05-23 13:48:41.253129+00	\N
019e5518-5fa5-75b7-b31a-0dfaa429b9a8	yCG5GonjoRuYF0mbd6EajKHCnSnY2nIv1P4SUTZX1YZQYm2fDEmFRFVrh1fo9kCz+qyXKXYP5ccjBx7wLT7m3A==	2026-05-30 13:48:41.252675+00	2026-05-23 18:19:59.0045+00	2026-05-23 18:20:59.0045+00	JIowRXg38mc8IgErtnr+w1epHrJg+u2eAqLe2oDZnpZfMM9dZ0B9K6Cv+aa932N9kfawC6T3Snnaq0XHF/ilJw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 13:48:41.253108+00	00000000-0000-0000-0000-000000000000	2026-05-23 18:19:59.005036+00	\N
019e551a-3d05-73d5-b45a-6fc57a8ab5c0	bai6SgOngjZtL+72ybtQdr4uiGWqaGkmksUScO5NPLWW1UpAU3FNU0B8Qn0jGbFEaBRrYzr5cVm41gRnhVPRfw==	2026-05-30 13:50:43.46096+00	2026-05-23 18:26:09.102963+00	2026-05-23 18:27:09.102963+00	oIIl/Az6y8JvVQhwwNftZpiuQFLpByDU/ycCHLfMgNitW8qY5i/GylelLZbh9634jauLOZqBgrsgOnsxxja2vg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 13:50:43.461258+00	00000000-0000-0000-0000-000000000000	2026-05-23 18:26:09.103263+00	\N
019e5610-c09c-733d-bf17-4c5dcf2326bb	JIowRXg38mc8IgErtnr+w1epHrJg+u2eAqLe2oDZnpZfMM9dZ0B9K6Cv+aa932N9kfawC6T3Snnaq0XHF/ilJw==	2026-05-30 18:19:59.004504+00	2026-05-23 18:42:09.246989+00	2026-05-23 18:43:09.246989+00	x5eCEP3nIbLNFX41g8J2en5NhqxREVe/8AzkHujlIttWLIfZCZQws8bxJLunUGbSSY9Wc1mSn82iJqD9b9pWzg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 18:19:59.005025+00	00000000-0000-0000-0000-000000000000	2026-05-23 18:42:09.248458+00	\N
019e5616-664f-768e-97f2-2a612b1df951	oIIl/Az6y8JvVQhwwNftZpiuQFLpByDU/ycCHLfMgNitW8qY5i/GylelLZbh9634jauLOZqBgrsgOnsxxja2vg==	2026-05-30 18:26:09.102966+00	2026-05-23 18:46:58.167359+00	2026-05-23 18:47:58.167361+00	zLKN6mjzN5wlHyaT8KLIvdpdLsfxXuG19shtzJiRIWqn3augwXuuw/Weljzy5cDIVxgL5UmuHH87+mEdNljBGw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 18:26:09.103252+00	00000000-0000-0000-0000-000000000000	2026-05-23 18:46:58.168723+00	\N
019e5625-0ce0-708e-92a3-8b53e8868a3d	x5eCEP3nIbLNFX41g8J2en5NhqxREVe/8AzkHujlIttWLIfZCZQws8bxJLunUGbSSY9Wc1mSn82iJqD9b9pWzg==	2026-05-30 18:42:09.246992+00	2026-05-24 01:34:18.475989+00	2026-05-24 01:35:18.475989+00	aahNDgNDEwiPXexPSw9Bz9VUXSdQi2Mp+n+9d1RTq8JlMxcSWu7SXDEdmFik4aNxBCad3/A0txF/UUMsrVb7aA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 18:42:09.248443+00	00000000-0000-0000-0000-000000000000	2026-05-24 01:34:18.480904+00	\N
019e5629-7578-75b7-b4e3-5607f41ce2f0	zLKN6mjzN5wlHyaT8KLIvdpdLsfxXuG19shtzJiRIWqn3augwXuuw/Weljzy5cDIVxgL5UmuHH87+mEdNljBGw==	2026-05-30 18:46:58.16737+00	2026-05-24 01:36:57.249417+00	2026-05-24 01:37:57.249418+00	q/EJhAhDPHpux98SKg9la2REf7AF+r8Me7zfqn+40Pn6fgEpYOs+zoiYOhiXL/yNINR+WvAOQ4tvkJLg6qJv2Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 18:46:58.168703+00	00000000-0000-0000-0000-000000000000	2026-05-24 01:36:57.251203+00	\N
019e579e-6370-7299-b65e-34ca04d97225	aahNDgNDEwiPXexPSw9Bz9VUXSdQi2Mp+n+9d1RTq8JlMxcSWu7SXDEdmFik4aNxBCad3/A0txF/UUMsrVb7aA==	2026-05-31 01:34:18.475993+00	2026-05-24 01:56:43.955978+00	2026-05-24 01:57:43.955979+00	D0TxUXTDf9tsUgznZE/Ff1HfmdenTX4W6DFMBC02ip7md6WuVnx0/NTfU6PRaG6f1LOnQjiao9BewzJlYx8mKQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 01:34:18.480884+00	00000000-0000-0000-0000-000000000000	2026-05-24 01:56:43.958785+00	\N
019e57a0-cfa2-70e8-94bf-b64e44d9c2b0	q/EJhAhDPHpux98SKg9la2REf7AF+r8Me7zfqn+40Pn6fgEpYOs+zoiYOhiXL/yNINR+WvAOQ4tvkJLg6qJv2Q==	2026-05-31 01:36:57.24942+00	2026-05-24 01:57:01.115522+00	2026-05-24 01:58:01.115523+00	cXCuyZTjKStvb69s8zIO7ELXkdFi/tjVYiucD6qFQ7DhxXVwpGmcN/5zdWCN//Bj+rlmL5uXfw7swGpBi1McvA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 01:36:57.251169+00	00000000-0000-0000-0000-000000000000	2026-05-24 01:57:01.115884+00	\N
019e57b2-eb36-7f89-805f-9995e8913be4	D0TxUXTDf9tsUgznZE/Ff1HfmdenTX4W6DFMBC02ip7md6WuVnx0/NTfU6PRaG6f1LOnQjiao9BewzJlYx8mKQ==	2026-05-31 01:56:43.955997+00	2026-05-24 02:22:03.118722+00	2026-05-24 02:23:03.118722+00	/Y0jCmL5CJdh/Cb5Vgri8U1OUrs/Mip1pJ7VKKCh1NTNtb+E3jGXNovpGpNgPFD7t7YPffYFfTJVABqInUKSxQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 01:56:43.95877+00	00000000-0000-0000-0000-000000000000	2026-05-24 02:22:03.121192+00	\N
019e57b3-2e3b-7235-a3df-14cf287a21d3	cXCuyZTjKStvb69s8zIO7ELXkdFi/tjVYiucD6qFQ7DhxXVwpGmcN/5zdWCN//Bj+rlmL5uXfw7swGpBi1McvA==	2026-05-31 01:57:01.115526+00	2026-05-24 02:24:31.628297+00	2026-05-24 02:25:31.628297+00	1EpzHnqBRAf7cQcau1yO8dKNGn9tgpdBxhOnuzEP8IekFIiasVjC795hh7cwsX6xL2NURdyfKUROAC4HHBlYSQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 01:57:01.115873+00	00000000-0000-0000-0000-000000000000	2026-05-24 02:24:31.628569+00	\N
019e57cc-5233-7c1f-98f2-32231be95e9a	ulYpoGcIDBw02Aj0mK3IMDO7vAiDel4ocZGTrCUUn4XSix/zHedHyv+7hyI6c2SPlvNXONPXMnSjfV9sxOir/A==	2026-05-31 02:24:28.723719+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 02:24:28.723948+00	00000000-0000-0000-0000-000000000000	2026-05-24 02:24:28.723948+00	\N
019e57ca-1970-7bf5-afca-0f27f79f224f	/Y0jCmL5CJdh/Cb5Vgri8U1OUrs/Mip1pJ7VKKCh1NTNtb+E3jGXNovpGpNgPFD7t7YPffYFfTJVABqInUKSxQ==	2026-05-31 02:22:03.118727+00	2026-05-24 03:31:38.868116+00	2026-05-24 03:32:38.86812+00	tCT5CdxWmZkFlhwa+ZlpsdggqoYIUu4UOp+kxNQJXrhAayS6fUpj+tmZGA3hf2wauggzmek5/BwDfKC0JH4ZFg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 02:22:03.121183+00	00000000-0000-0000-0000-000000000000	2026-05-24 03:31:38.876402+00	\N
019e57cc-52a3-7ca8-bacd-6a753436c364	ubjV0c9oT1XupF5nsdAOrhoNLX67IT7uNbVyHs8Zu3YZEGhOj6ttFSEIUsnpn5Wa88J52jkNtHpDiwSmlXmRBA==	2026-05-31 02:24:28.835118+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 02:24:28.835645+00	00000000-0000-0000-0000-000000000000	2026-05-24 02:24:28.835645+00	\N
019e57cc-5d8c-7dca-a170-9fa5dfa4c14b	1EpzHnqBRAf7cQcau1yO8dKNGn9tgpdBxhOnuzEP8IekFIiasVjC795hh7cwsX6xL2NURdyfKUROAC4HHBlYSQ==	2026-05-31 02:24:31.6283+00	2026-05-24 13:27:29.478778+00	2026-05-24 13:28:29.478886+00	ZXBwigH1P/1pls/v1vpzT3PPhsnj03lYXxkxvhGm+OA4rSAmM57OeGVgK1CzHcL9zcrv75lyOI9CSlfck2aplQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 02:24:31.628562+00	00000000-0000-0000-0000-000000000000	2026-05-24 13:27:29.563896+00	\N
019e54f1-62e3-7654-84e7-5b0a923c82ce	IrODcDbQKvuQrQtdFxKEXBQd/F4kSuLkf9S374NkrfnozXfuHVjD5bft5kRMMqMTEaO+co5Mmkfiy/Mfrrp9Bg==	2026-05-30 13:06:05.772871+00	2026-05-26 03:40:52.115898+00	2026-05-26 03:41:52.115951+00	ct8cMQEVrE2/GhiLLz9s7cYbnu7l0s8iCWAiTQOCSnSmyEGO7MP4ajyjqgiIL+1sFZV2d7BCsBCWXV0qvBoDPQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-23 13:06:06.274934+00	00000000-0000-0000-0000-000000000000	2026-05-26 03:40:52.614353+00	\N
019e5809-d0fa-72dc-88d6-d670e6dd3b8a	tCT5CdxWmZkFlhwa+ZlpsdggqoYIUu4UOp+kxNQJXrhAayS6fUpj+tmZGA3hf2wauggzmek5/BwDfKC0JH4ZFg==	2026-05-31 03:31:38.868133+00	2026-05-24 04:55:15.637982+00	2026-05-24 04:56:15.63802+00	XhpAlJ6+e5/Br0C7lZSPtD/cLW5+nUBmFRH/abkPhqEZE3II4NRdamap7troDd65sRJEFzrIEzx2UJ/69ID8Ow==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 03:31:38.876379+00	00000000-0000-0000-0000-000000000000	2026-05-24 04:55:15.689079+00	\N
019e5856-5de0-7b72-8727-c075145408dc	XhpAlJ6+e5/Br0C7lZSPtD/cLW5+nUBmFRH/abkPhqEZE3II4NRdamap7troDd65sRJEFzrIEzx2UJ/69ID8Ow==	2026-05-31 04:55:15.63868+00	2026-05-24 05:15:54.220173+00	2026-05-24 05:16:54.220233+00	lFFfTMiAEo406GLkh8tDH3u6q52zwEEEJc2hRe6/HTS1EGnc6PVudIDjVkhBQ6CCtWCbkoJ7LQn7hxz0EIx2Sg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 04:55:15.688505+00	00000000-0000-0000-0000-000000000000	2026-05-24 05:15:54.28154+00	\N
019e5869-4420-7546-833b-913910bb1917	lFFfTMiAEo406GLkh8tDH3u6q52zwEEEJc2hRe6/HTS1EGnc6PVudIDjVkhBQ6CCtWCbkoJ7LQn7hxz0EIx2Sg==	2026-05-31 05:15:54.221042+00	2026-05-24 05:50:29.930177+00	2026-05-24 05:51:29.930232+00	ZpD4BFEh6dB8wGctkKxuAp1kA1JB1Gj4Lbzl/nQqp/qx+TadkYfwcqmkvfCQjVHFMPDyI1+YXvvLjtoDkk1o6w==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 05:15:54.281153+00	00000000-0000-0000-0000-000000000000	2026-05-24 05:50:29.989216+00	\N
019e5888-f05b-71e7-8f9c-913f013ed0ee	ZpD4BFEh6dB8wGctkKxuAp1kA1JB1Gj4Lbzl/nQqp/qx+TadkYfwcqmkvfCQjVHFMPDyI1+YXvvLjtoDkk1o6w==	2026-05-31 05:50:29.931134+00	2026-05-24 06:13:45.806023+00	2026-05-24 06:14:45.806023+00	ZVJFCv08eCabtmPVZd8RajsMH2/YfE2bYoltpbXAkYqI3Dbto+i1sZ9ae8uKU7EDYrTBJEqDx75w3izLWtFvkA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 05:50:29.988851+00	00000000-0000-0000-0000-000000000000	2026-05-24 06:13:45.807974+00	\N
019e589e-3ccf-73f4-9302-8201ca27a72f	ZVJFCv08eCabtmPVZd8RajsMH2/YfE2bYoltpbXAkYqI3Dbto+i1sZ9ae8uKU7EDYrTBJEqDx75w3izLWtFvkA==	2026-05-31 06:13:45.806026+00	2026-05-24 06:38:28.532589+00	2026-05-24 06:39:28.53259+00	3gCr+tl/YNUkzVQX12Kc4EweW0AJ3abhX7Qo8hSkNT+HxfIEaq9lgyke/4WbQcqbT6fKYOE7i2zQaJ0XaxF0RQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 06:13:45.807944+00	00000000-0000-0000-0000-000000000000	2026-05-24 06:38:28.533754+00	\N
019e58c8-05c9-79b8-a33e-203cd91cbaa6	l8NK373IMjQTtR6RXwNKfQ3tgCGxNxp7aUu5MhW99s/t5q91KwEZn6GtcdCuJ4X1PgevqDcqCBRCB/WXkcVquQ==	2026-05-31 06:59:23.92692+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-24 06:59:24.534372+00	00000000-0000-0000-0000-000000000000	2026-05-24 06:59:24.534372+00	\N
019e58b4-dcb5-70d2-8c07-7e21dba0b318	3gCr+tl/YNUkzVQX12Kc4EweW0AJ3abhX7Qo8hSkNT+HxfIEaq9lgyke/4WbQcqbT6fKYOE7i2zQaJ0XaxF0RQ==	2026-05-31 06:38:28.532596+00	2026-05-24 07:00:35.097039+00	2026-05-24 07:01:35.097101+00	QoeS9+Il0gW5wXFpCkxOsq4Y0kqG408y5f5UXgeVZQl/0uwIgpRtO67mV6x9ldoo4lT43lL556rtpwZugRtLPQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 06:38:28.533738+00	00000000-0000-0000-0000-000000000000	2026-05-24 07:00:35.155226+00	\N
019e58c9-1ac9-7c27-8de5-a17ba7857173	QoeS9+Il0gW5wXFpCkxOsq4Y0kqG408y5f5UXgeVZQl/0uwIgpRtO67mV6x9ldoo4lT43lL556rtpwZugRtLPQ==	2026-05-31 07:00:35.098013+00	2026-05-24 07:21:15.476122+00	2026-05-24 07:22:15.476182+00	tWkKFfLBjb9jl9/Gg43ISLUCYr3LkKSbod+FvTfiVzGOtTcb5oIh3oVkbBxEgWPBWIDx/DieSsVuH+G9xr1GPg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 07:00:35.154818+00	00000000-0000-0000-0000-000000000000	2026-05-24 07:21:15.531081+00	\N
019e58dc-0802-750b-8781-55926449a869	tWkKFfLBjb9jl9/Gg43ISLUCYr3LkKSbod+FvTfiVzGOtTcb5oIh3oVkbBxEgWPBWIDx/DieSsVuH+G9xr1GPg==	2026-05-31 07:21:15.477032+00	2026-05-24 07:42:37.704467+00	2026-05-24 07:43:37.704528+00	WnZ369I/P7POjg210dFsJzox2x4aRzd+YF6o3mTllZWiTBPaRrBj9K/6axMTc9WSsxSZJaeSAnDY2SqXWzr1Hg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 07:21:15.530685+00	00000000-0000-0000-0000-000000000000	2026-05-24 07:42:37.732053+00	\N
019e58ef-989f-7278-af07-cbfcd434f47a	WnZ369I/P7POjg210dFsJzox2x4aRzd+YF6o3mTllZWiTBPaRrBj9K/6axMTc9WSsxSZJaeSAnDY2SqXWzr1Hg==	2026-05-31 07:42:37.705494+00	2026-05-24 08:11:20.743861+00	2026-05-24 08:12:20.743914+00	60ZJbGcLGSRAk2R1xv8F0+vKRfRleX7zEhJGU07WWOCjA8XFjCOHqNZe21qDTS6jJJdbk6gPy9XJh2fzJx6LkA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 07:42:37.732026+00	00000000-0000-0000-0000-000000000000	2026-05-24 08:11:20.800686+00	\N
019e5909-e356-7343-bada-31be37104b78	60ZJbGcLGSRAk2R1xv8F0+vKRfRleX7zEhJGU07WWOCjA8XFjCOHqNZe21qDTS6jJJdbk6gPy9XJh2fzJx6LkA==	2026-05-31 08:11:20.744687+00	2026-05-24 12:02:05.962477+00	2026-05-24 12:03:05.962477+00	fs7w7Bad+EbM4K5khwjjlK0rjwM5VqsD8YYCdifmoVMnrZQA+lry6xvLwwTgo+Dvc5JA1+6pm36nYHc1UvANxQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 08:11:20.799993+00	00000000-0000-0000-0000-000000000000	2026-05-24 12:02:05.96385+00	\N
019e59dd-260b-79d6-ac02-5175b6737a72	fs7w7Bad+EbM4K5khwjjlK0rjwM5VqsD8YYCdifmoVMnrZQA+lry6xvLwwTgo+Dvc5JA1+6pm36nYHc1UvANxQ==	2026-05-31 12:02:05.96248+00	2026-05-24 12:22:34.023504+00	2026-05-24 12:23:34.023505+00	OcOaAY9KbEZl62ph857IHzV0SpFa6eCSECFRBJyFLkaFe0tjQCfuBWucvhdCXqBnYtz8zweXc0o07sCSnNtrOw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 12:02:05.963829+00	00000000-0000-0000-0000-000000000000	2026-05-24 12:22:34.02737+00	\N
019e59ef-e32a-7f61-9f59-8f371c17826e	OcOaAY9KbEZl62ph857IHzV0SpFa6eCSECFRBJyFLkaFe0tjQCfuBWucvhdCXqBnYtz8zweXc0o07sCSnNtrOw==	2026-05-31 12:22:34.023514+00	2026-05-24 12:49:41.626311+00	2026-05-24 12:50:41.626364+00	gmZ/nXgVftsFmVuPPOzp879K5CQ3qIIlCQzjupM5/RgSlavhGr3xyiQJCObcBGINfWj3fekMDRPdqfOzTimgNQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 12:22:34.027329+00	00000000-0000-0000-0000-000000000000	2026-05-24 12:49:41.680539+00	\N
019e5a08-b927-7f89-9ba7-181ea9026eec	gmZ/nXgVftsFmVuPPOzp879K5CQ3qIIlCQzjupM5/RgSlavhGr3xyiQJCObcBGINfWj3fekMDRPdqfOzTimgNQ==	2026-05-31 12:49:41.627119+00	2026-05-24 13:10:18.000472+00	2026-05-24 13:11:18.000541+00	eCVdY4UpYVzUTVRwW5LH204Mgpm/td5rUFW8y45TQz0zS/yPU/scwnQyggiDSE7rc7Iq+QRJQAmkwXM0mPP0+w==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 12:49:41.679915+00	00000000-0000-0000-0000-000000000000	2026-05-24 13:10:18.077824+00	\N
019e5a23-985b-75e9-a235-e2acd5ef3658	SdRvaKxWD6N0png4Kn4U1FXd9LWejQGs/l/+0ozeNyT/oKIjrBNRt/ygrgQqRnPIF8pKXk/c2u5/+w7qKbo6ow==	2026-05-31 13:19:02.354588+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-24 13:19:02.956093+00	00000000-0000-0000-0000-000000000000	2026-05-24 13:19:02.956093+00	\N
019e5a1b-96d2-7357-be5b-92975faee3f1	eCVdY4UpYVzUTVRwW5LH204Mgpm/td5rUFW8y45TQz0zS/yPU/scwnQyggiDSE7rc7Iq+QRJQAmkwXM0mPP0+w==	2026-05-31 13:10:18.001373+00	2026-05-24 13:40:23.55757+00	2026-05-24 13:41:23.557571+00	9n4y71qk26/LzQM/xE390DE9WeRxK3hgaynNxB3Gc3vASUrgeBVwl1Pss62cPqbj+kp06Rp8PBWI4jPtIIMoCw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 13:10:18.077285+00	00000000-0000-0000-0000-000000000000	2026-05-24 13:40:23.5597+00	\N
019e5a37-2387-7711-8271-59880a56e1e8	9n4y71qk26/LzQM/xE390DE9WeRxK3hgaynNxB3Gc3vASUrgeBVwl1Pss62cPqbj+kp06Rp8PBWI4jPtIIMoCw==	2026-05-31 13:40:23.557573+00	2026-05-24 14:02:26.279598+00	2026-05-24 14:03:26.27966+00	aJRYReR3jDTXZCSVyLxbL+z/MaNkeJYetqTa1HMoPHnkiaSIb0TOdkMm4aenr3vAToNy7C2xyPilHP+pPtuJeA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 13:40:23.559682+00	00000000-0000-0000-0000-000000000000	2026-05-24 14:02:26.315604+00	\N
019e5a4b-5285-7840-ac11-e924b64d603b	aJRYReR3jDTXZCSVyLxbL+z/MaNkeJYetqTa1HMoPHnkiaSIb0TOdkMm4aenr3vAToNy7C2xyPilHP+pPtuJeA==	2026-05-31 14:02:26.280439+00	2026-05-24 14:22:52.851302+00	2026-05-24 14:23:52.851304+00	1C888Vk3vzp/MUDKUE9aetpbC9MBNIf/k0FiKbOl8j8baHBWfBvTkLY9xUGVN4qraIMNzR0V7a2DYsUgLzv/5A==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 14:02:26.315512+00	00000000-0000-0000-0000-000000000000	2026-05-24 14:22:52.864686+00	\N
019e5a5e-09bf-75f0-8cf8-919634e18f5f	1C888Vk3vzp/MUDKUE9aetpbC9MBNIf/k0FiKbOl8j8baHBWfBvTkLY9xUGVN4qraIMNzR0V7a2DYsUgLzv/5A==	2026-05-31 14:22:52.851336+00	2026-05-24 15:41:55.239271+00	2026-05-24 15:42:55.239327+00	fZyDhlHTX6q1yKkVOUf6lvbToHr3pWDOwG9Ld06K/EQpI2/GFFe9wSPMKda0UT+h+AwYJzOqDFLeZvsKn9e1qw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 14:22:52.86466+00	00000000-0000-0000-0000-000000000000	2026-05-24 15:41:55.301708+00	\N
019e5aa6-66dc-72c7-8e89-3b5a20f3c94f	fZyDhlHTX6q1yKkVOUf6lvbToHr3pWDOwG9Ld06K/EQpI2/GFFe9wSPMKda0UT+h+AwYJzOqDFLeZvsKn9e1qw==	2026-05-31 15:41:55.240122+00	2026-05-24 16:04:14.845453+00	2026-05-24 16:05:14.8455+00	n4JUN9Bw8yis0Tbq3kYNcKxmmfW53frJ8glyvbYJpJd/xpNgRd465ty1F+rDNgkXcu7ibH5E4mIPlsS2Yel5Yg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 15:41:55.301129+00	00000000-0000-0000-0000-000000000000	2026-05-24 16:04:14.900199+00	\N
019e5aba-d7aa-7801-a936-f7c41fcfb7b8	n4JUN9Bw8yis0Tbq3kYNcKxmmfW53frJ8glyvbYJpJd/xpNgRd465ty1F+rDNgkXcu7ibH5E4mIPlsS2Yel5Yg==	2026-05-31 16:04:14.846298+00	2026-05-25 15:57:05.176161+00	2026-05-25 15:58:05.176219+00	apV1lXQrWvBguuG817tYN6dRmRYf9/HXrHjtCyVr/YX3JnffHhZ1fXJrWdOET5H6paPqqp1zW0SJj9ZqQawrFg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 16:04:14.899805+00	00000000-0000-0000-0000-000000000000	2026-05-25 15:57:05.239387+00	\N
019e5fda-a54c-75f5-b217-7b8cce41526c	apV1lXQrWvBguuG817tYN6dRmRYf9/HXrHjtCyVr/YX3JnffHhZ1fXJrWdOET5H6paPqqp1zW0SJj9ZqQawrFg==	2026-06-01 15:57:05.17708+00	2026-05-25 16:53:41.5906+00	2026-05-25 16:54:41.590664+00	Ci4JFi79lDMTjtixm1oMxbuYhz8lrqpEAkg6fuLB/+vvRjMgBm1NOLEyVwUJAy81GQOU7r1bEb16m9WZ3dUP3g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-25 15:57:05.238586+00	00000000-0000-0000-0000-000000000000	2026-05-25 16:53:41.649809+00	\N
019e600e-7886-734f-85cf-4172dee3778b	Ci4JFi79lDMTjtixm1oMxbuYhz8lrqpEAkg6fuLB/+vvRjMgBm1NOLEyVwUJAy81GQOU7r1bEb16m9WZ3dUP3g==	2026-06-01 16:53:41.591477+00	2026-05-25 17:24:55.284484+00	2026-05-25 17:25:55.284545+00	XCLPLTeOQQSmh2sAtD4LU/eksKOyFAZnk6MdHpxjHBo/tlqyJ8idWg4l6sv+M9E4ZMmK+33jORawXYPcbeX28A==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-25 16:53:41.649019+00	00000000-0000-0000-0000-000000000000	2026-05-25 17:24:55.342355+00	\N
019e602b-0fa6-7643-8477-f0cf0b2cac32	XCLPLTeOQQSmh2sAtD4LU/eksKOyFAZnk6MdHpxjHBo/tlqyJ8idWg4l6sv+M9E4ZMmK+33jORawXYPcbeX28A==	2026-06-01 17:24:55.28541+00	2026-05-26 02:05:04.156691+00	2026-05-26 02:06:04.15676+00	UCYnV+PPzi2gc/EVY4GllaZuNxTxSFkuPR2lS8HwTrOAzKY95zyxyl/U57xJfialFu/awlfIJmeqha6oEWuO4w==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-25 17:24:55.341774+00	00000000-0000-0000-0000-000000000000	2026-05-26 02:05:04.222349+00	\N
019e6207-454f-70c8-8a14-c545f41cd465	UCYnV+PPzi2gc/EVY4GllaZuNxTxSFkuPR2lS8HwTrOAzKY95zyxyl/U57xJfialFu/awlfIJmeqha6oEWuO4w==	2026-06-02 02:05:04.157637+00	2026-05-26 02:31:43.752298+00	2026-05-26 02:32:43.752298+00	PPPOSJ8kKTiXQfkvwrE4jPd94rfhfC3Q/MIXy64nncRvFy7vNreN1ylBNBFno5DU7Dr9qeOGFh2pOcXifS5XaA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 02:05:04.221532+00	00000000-0000-0000-0000-000000000000	2026-05-26 02:31:43.752648+00	\N
019e621f-ad88-77e4-8ece-506eaf67ddd9	PPPOSJ8kKTiXQfkvwrE4jPd94rfhfC3Q/MIXy64nncRvFy7vNreN1ylBNBFno5DU7Dr9qeOGFh2pOcXifS5XaA==	2026-06-02 02:31:43.752301+00	2026-05-26 02:51:44.166748+00	2026-05-26 02:52:44.166749+00	lA7yMIsw1xaj7W3R0fb5nePuEX8ettKUYMkvfXH9ZTZ4H8puZUGzax7fwle0lAASl8hGXANaJB7pG99DBd6Ttg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 02:31:43.752636+00	00000000-0000-0000-0000-000000000000	2026-05-26 02:51:44.167037+00	\N
019e6231-fea6-7f28-8efb-2aaad963a4cf	lA7yMIsw1xaj7W3R0fb5nePuEX8ettKUYMkvfXH9ZTZ4H8puZUGzax7fwle0lAASl8hGXANaJB7pG99DBd6Ttg==	2026-06-02 02:51:44.166751+00	2026-05-26 03:12:17.459855+00	2026-05-26 03:13:17.459905+00	OI0OKTmfvzJiC1Gs/jZ4v57o3UWcCvGWR5oAeVPJcV4mqGGQxPpE8k7IfpChTaEdDw7w5B1C6UQLcJazLUal5w==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 02:51:44.167016+00	00000000-0000-0000-0000-000000000000	2026-05-26 03:12:17.521302+00	\N
019e492a-a898-79f2-919f-bf0ce4a39bc8	otxsu6/5k3uxRN02RFQTlAp8ys4YhZ6F3BUfz9LZ8a0aFf1QQIpNAf6TvrEZOYa/vAcEMmzcEOqaP6X7SgWdiA==	2026-05-28 06:13:12.494782+00	2026-05-26 08:29:03.226492+00	2026-05-26 08:30:03.226528+00	NjB2lDdg63BZY5uWdbK4InwxQsHHh/QvcTDay+r9/877mvI1aGXtwCIF+nbLjReailKs3SSUEQ7h3xbHLclJlg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-21 06:13:13.085586+00	00000000-0000-0000-0000-000000000000	2026-05-26 08:29:03.634881+00	\N
019e6381-886c-73a3-9d5b-a17816da3610	va1WUwUIYYaT+eHc7xCRTnrCFG3GOGoC9BfpsBtibwz+XD3QmwOYABewna9ofuailJdEpVVaiAczCb13LJjKcw==	2026-06-02 08:58:13.995158+00	2026-05-26 13:43:44.621831+00	2026-05-26 13:44:44.621867+00	BCpiznDShMI68fAg2qKMIQtCTFzgxSqmic3Cb51hkRYyyWLvgoImXk6Y2HCCR0apJxzC51bYD/qQdxoCFuie9Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 08:58:13.997013+00	00000000-0000-0000-0000-000000000000	2026-05-26 13:43:45.123393+00	\N
019e625e-fbfa-74c6-8b5a-b57cc3174042	ct8cMQEVrE2/GhiLLz9s7cYbnu7l0s8iCWAiTQOCSnSmyEGO7MP4ajyjqgiIL+1sFZV2d7BCsBCWXV0qvBoDPQ==	2026-06-02 03:40:52.116764+00	2026-05-26 15:40:32.138524+00	2026-05-26 15:41:32.138555+00	2ObDyyea9G88D4Ki5dFg+gsVjcY7a5trPWeQsx0fX5wQdf//8/2omxrcRT+1ItNBVRC6URGrqEOM9OenP/onpw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 03:40:52.613809+00	00000000-0000-0000-0000-000000000000	2026-05-26 15:40:32.549924+00	\N
019e6244-d067-7742-ab27-5f45431f05dd	OI0OKTmfvzJiC1Gs/jZ4v57o3UWcCvGWR5oAeVPJcV4mqGGQxPpE8k7IfpChTaEdDw7w5B1C6UQLcJazLUal5w==	2026-06-02 03:12:17.46068+00	2026-05-26 16:03:52.338194+00	2026-05-26 16:04:52.338234+00	4gIQX3PAInoxjPMtXwJLhdoJtjNhNCO5+DQxtQkMVApVNZ2+1pDEjdrjeOnXu7SRtl25sUw0efWvD2ePv1pO+A==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 03:12:17.520638+00	00000000-0000-0000-0000-000000000000	2026-05-26 16:03:52.394873+00	\N
019e6507-37c1-7a7d-92f3-bb02d4a13f64	4gIQX3PAInoxjPMtXwJLhdoJtjNhNCO5+DQxtQkMVApVNZ2+1pDEjdrjeOnXu7SRtl25sUw0efWvD2ePv1pO+A==	2026-06-02 16:03:52.338971+00	2026-05-27 00:54:00.773754+00	2026-05-27 00:55:00.773807+00	Z5YH3Ao/VXlYkJ5gl9N+ZVelrjju4glDGFTu/J0KgML5Ih8lxUOdMaGvILTvdqjTYcLDGBbqsO/BuV4WfgexIA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 16:03:52.394256+00	00000000-0000-0000-0000-000000000000	2026-05-27 00:54:00.839055+00	\N
019e66ec-937c-75bb-9987-ea3c9be0dcaa	Z5YH3Ao/VXlYkJ5gl9N+ZVelrjju4glDGFTu/J0KgML5Ih8lxUOdMaGvILTvdqjTYcLDGBbqsO/BuV4WfgexIA==	2026-06-03 00:54:00.77465+00	2026-05-27 01:15:58.112175+00	2026-05-27 01:16:58.112232+00	LJISfcxdYXG8mM7vViMoE9CY4qO9CwlVIJgX3+x1E92/LpipVxqveCpL6+c4ndxWtXeqIsqOaCl3T8JJEVub2A==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 00:54:00.838234+00	00000000-0000-0000-0000-000000000000	2026-05-27 01:15:58.137658+00	\N
019e6700-ad36-701f-b68f-b138844b3e69	LJISfcxdYXG8mM7vViMoE9CY4qO9CwlVIJgX3+x1E92/LpipVxqveCpL6+c4ndxWtXeqIsqOaCl3T8JJEVub2A==	2026-06-03 01:15:58.113056+00	2026-05-27 01:37:00.348648+00	2026-05-27 01:38:00.348693+00	0Kdo1P1ImmeRtyGQV3FV7rp1ppxv/SbY8GvMrhz0Tw4wVsRRTXJDWwv0Aq3mA7VIbxACTveyR+8xR8vj9gdP5g==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 01:15:58.137642+00	00000000-0000-0000-0000-000000000000	2026-05-27 01:37:00.373439+00	\N
019e5a2b-5410-7736-a8b0-39392e193984	ZXBwigH1P/1pls/v1vpzT3PPhsnj03lYXxkxvhGm+OA4rSAmM57OeGVgK1CzHcL9zcrv75lyOI9CSlfck2aplQ==	2026-05-31 13:27:29.479979+00	2026-05-27 01:53:49.987241+00	2026-05-27 01:54:49.987342+00	s7yxc9rZMCekK7q7Klx3Xk9zMcVfjvxIHi/6wcCMJSIB6NaA6XcyGA8S5T01XjJIh3gbc1UHqfN5WWcBucH0Xg==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 13:27:29.563496+00	00000000-0000-0000-0000-000000000000	2026-05-27 01:53:50.037911+00	\N
019e6713-efd2-7eaf-b0e4-8712e2990b88	0Kdo1P1ImmeRtyGQV3FV7rp1ppxv/SbY8GvMrhz0Tw4wVsRRTXJDWwv0Aq3mA7VIbxACTveyR+8xR8vj9gdP5g==	2026-06-03 01:37:00.349346+00	2026-05-27 01:57:00.451157+00	2026-05-27 01:58:00.451157+00	IC7yjI1YkeWKuvnUX4Ai5ke6QljY4sC/efLaDkuoFXUyseyaC9Cbvo4p117uIfZvzAgEqpn6pLD+jQWHT+yamA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 01:37:00.373351+00	00000000-0000-0000-0000-000000000000	2026-05-27 01:57:00.453002+00	\N
019e6726-3fa4-7e79-a35d-7e280f32acbe	IC7yjI1YkeWKuvnUX4Ai5ke6QljY4sC/efLaDkuoFXUyseyaC9Cbvo4p117uIfZvzAgEqpn6pLD+jQWHT+yamA==	2026-06-03 01:57:00.45116+00	2026-05-27 02:33:01.606653+00	2026-05-27 02:34:01.606716+00	ClciVyrII5Y291IhA6n6igkR2lOY9k81IE1zhch210XQ3i2A6AF985jyaPJXYY07U7bFMCVCqokSe/8KlHXgGw==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 01:57:00.452971+00	00000000-0000-0000-0000-000000000000	2026-05-27 02:33:01.638792+00	\N
019e6723-57ce-734b-9181-14bce48ddfaa	s7yxc9rZMCekK7q7Klx3Xk9zMcVfjvxIHi/6wcCMJSIB6NaA6XcyGA8S5T01XjJIh3gbc1UHqfN5WWcBucH0Xg==	2026-06-03 01:53:49.988587+00	2026-05-27 02:34:38.910191+00	2026-05-27 02:35:38.910191+00	0YTY+qFRBflLtI98/faagXh+JcAbpiB8KB50v04tKqAfkGGvWwvgVsSHb9dJQGjE5BHpyOJHcM9+njsiv6Y/3Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 01:53:50.037879+00	00000000-0000-0000-0000-000000000000	2026-05-27 02:34:38.912716+00	\N
019e6747-39c4-7642-97f0-5eedbc42c9ce	ClciVyrII5Y291IhA6n6igkR2lOY9k81IE1zhch210XQ3i2A6AF985jyaPJXYY07U7bFMCVCqokSe/8KlHXgGw==	2026-06-03 02:33:01.607848+00	2026-05-27 02:54:19.141538+00	2026-05-27 02:55:19.141538+00	8DzB5KMFkIRgR41beAQbMzbMWbD9yskAOwbtzHzTkqOn1XdSuk3aFAxkcsNELyAHi3IPaJD4/JxE4njhJOkvQA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 02:33:01.63877+00	00000000-0000-0000-0000-000000000000	2026-05-27 02:54:19.143691+00	\N
019e6748-b5c0-7c4f-9af9-03d91114c81e	0YTY+qFRBflLtI98/faagXh+JcAbpiB8KB50v04tKqAfkGGvWwvgVsSHb9dJQGjE5BHpyOJHcM9+njsiv6Y/3Q==	2026-06-03 02:34:38.910195+00	2026-05-27 02:56:21.395582+00	2026-05-27 02:57:21.395583+00	z6OuAyTQJPvsScAdwDo2M8W3OBL2Hkx/rkCZBQb7uJFCH2xyZBY6jTTM53LTucWEtM6TTsLIj8aWPE7w5TDazA==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 02:34:38.912683+00	00000000-0000-0000-0000-000000000000	2026-05-27 02:56:21.4009+00	\N
019e675c-9597-75ba-b5e9-3727404b7b44	z6OuAyTQJPvsScAdwDo2M8W3OBL2Hkx/rkCZBQb7uJFCH2xyZBY6jTTM53LTucWEtM6TTsLIj8aWPE7w5TDazA==	2026-06-03 02:56:21.395587+00	2026-05-27 03:06:58.788335+00	2026-05-27 03:07:58.790896+00	h683ncScUpuqwHWNbXNJvbksJIKE09LrfnVUu3T/j0sBJ2Ico6MfCUWOi40twAy3j2JrmPEhf/34kH5a9jUeJQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 02:56:21.40087+00	00000000-0000-0000-0000-000000000000	2026-05-27 03:06:59.512632+00	\N
019e675a-b807-75e2-8224-57af3686a1e1	8DzB5KMFkIRgR41beAQbMzbMWbD9yskAOwbtzHzTkqOn1XdSuk3aFAxkcsNELyAHi3IPaJD4/JxE4njhJOkvQA==	2026-06-03 02:54:19.141547+00	2026-05-27 03:06:58.788245+00	2026-05-27 03:07:58.790877+00	UHtBicC4dAFkZZRa9vhOqDUJysghVCu2O9FgEkxl8GGrRAQ8eak1UGon4q65IoJsLQYtUchloYiXH3uwGe0lZQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 02:54:19.143648+00	00000000-0000-0000-0000-000000000000	2026-05-27 03:06:59.585146+00	\N
019e6779-b75a-7960-91be-25cab8a6de52	wJ1shiaNr67ONTos7YB3Y9SH7qmPl4AF+Ie6BPECkHi7o30pjAoT0R4+1AABeN4ZeaY1dgQFyZFdB7n/pCHcpw==	2026-06-03 03:28:10.578281+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 03:28:10.678253+00	00000000-0000-0000-0000-000000000000	2026-05-27 03:28:10.678253+00	\N
019e64f1-db9b-76ad-96c0-065b62d26d5c	2ObDyyea9G88D4Ki5dFg+gsVjcY7a5trPWeQsx0fX5wQdf//8/2omxrcRT+1ItNBVRC6URGrqEOM9OenP/onpw==	2026-06-02 15:40:32.139374+00	2026-05-27 03:31:22.954413+00	2026-05-27 03:32:22.954452+00	Pbjnyqi+BbGWMIeqpcrsIKfvP6FVQoy0bkqFGwhy7DwLNfZuRKFIl2zyuIc51Z4vy+hb4FRp4suEs5V/d/DebQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 15:40:32.549454+00	00000000-0000-0000-0000-000000000000	2026-05-27 03:31:22.95543+00	\N
019e6766-521e-72e6-875f-7f515c3046d9	h683ncScUpuqwHWNbXNJvbksJIKE09LrfnVUu3T/j0sBJ2Ico6MfCUWOi40twAy3j2JrmPEhf/34kH5a9jUeJQ==	2026-06-03 03:06:58.796882+00	2026-05-27 03:36:14.386268+00	2026-05-27 03:37:14.386268+00	N2jCGpkjPk7DsuKntfcjbfYYTo+PYG9ApYWU6+sfw9tSQJ1LE84QIDwTOiV8Nk2/QIgMwq+nfDG2+frO3YIFPQ==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 03:06:59.512047+00	00000000-0000-0000-0000-000000000000	2026-05-27 03:36:14.386634+00	\N
019e6781-1932-7d8c-b5dd-4cb07968b077	N2jCGpkjPk7DsuKntfcjbfYYTo+PYG9ApYWU6+sfw9tSQJ1LE84QIDwTOiV8Nk2/QIgMwq+nfDG2+frO3YIFPQ==	2026-06-03 03:36:14.386271+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 03:36:14.386617+00	00000000-0000-0000-0000-000000000000	2026-05-27 03:36:14.386617+00	\N
019e6783-4aea-7cff-a775-b3463d9741ef	NefoVsHS2AdYegi85dH38RxOlIo6u9HCTfEkx/c9TUg1ieDAEcuQmTSjzrBDHeNBqOxVe3ej9qOPiCFdXwkhKg==	2026-06-03 03:38:38.186626+00	\N	\N	\N	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-27 03:38:38.186953+00	00000000-0000-0000-0000-000000000000	2026-05-27 03:38:38.186953+00	\N
019e6486-ee80-7344-9fe5-db0c5bc17067	BCpiznDShMI68fAg2qKMIQtCTFzgxSqmic3Cb51hkRYyyWLvgoImXk6Y2HCCR0apJxzC51bYD/qQdxoCFuie9Q==	2026-06-02 13:43:44.622827+00	2026-05-27 05:14:21.808917+00	2026-05-27 05:15:21.80897+00	SBKU1rM/roKlTVLd7cg26Tv5An7S5Wgn6cXLe6ENr8Ep1UH+ptS0u1grsy7i/MFhJcB74PGFlF2G93i55ceP+Q==	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-26 13:43:45.12273+00	00000000-0000-0000-0000-000000000000	2026-05-27 05:14:22.309118+00	\N
019e67da-f0da-7433-9651-e18901032195	SBKU1rM/roKlTVLd7cg26Tv5An7S5Wgn6cXLe6ENr8Ep1UH+ptS0u1grsy7i/MFhJcB74PGFlF2G93i55ceP+Q==	2026-06-03 05:14:21.809755+00	\N	\N	\N	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 05:14:22.308443+00	00000000-0000-0000-0000-000000000000	2026-05-27 05:14:22.308443+00	\N
\.


--
-- TOC entry 3621 (class 0 OID 16435)
-- Dependencies: 222
-- Data for Name: SaaSConfigurations; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."SaaSConfigurations" ("Id", "PlatformName", "BillingEmail", "TaxPercentage", "GracePeriodDays", "Currency", "BillingAddress", "SupportPhone", "SupportEmail", "IsMaintenanceMode", "TermsUrl", "PrivacyUrl", "MaintenanceStartTime", "MaintenanceEndTime", "MonthlyRevenueTarget", "SubscriptionTarget", "UptimeThreshold", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "GstNo") FROM stdin;
a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d	GymForge	admin@gymforge.com	18.00	7	INR	One Indiabulls Centre,Tower 1C, 3rd Floor, Lower Parel, Mumbai, Maharashtra 400013, India	\N	\N	f	\N	\N	\N	\N	100000.00	10	99.90	2026-04-25 00:00:00+00	00000000-0000-0000-0000-000000000000	2026-05-27 03:27:19.472915+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	\N
\.


--
-- TOC entry 3627 (class 0 OID 16571)
-- Dependencies: 228
-- Data for Name: SaaSPaymentTransactions; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."SaaSPaymentTransactions" ("Id", "GymId", "SubscriptionId", "Amount", "Currency", "Status", "GatewayTransactionId", "GatewayResponse", "FailureReason", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
9b6ff51c-62f7-4bac-8480-067669ec4b16	472d8778-9a41-490d-aba9-3ccb02ab3ff3	0d55f94f-8e0c-4d5b-89bb-2e76f557867c	499.00	INR	Success	order_SjPS2w8C0PL7cP	pay_SjPSClTJS2LbBR	\N	2026-04-29 18:36:02.461334+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:36:26.868469+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
5156fd5a-0ab8-4372-adbc-65bf07c6caaf	472d8778-9a41-490d-aba9-3ccb02ab3ff3	f202dafb-a8bc-4ffd-b38d-bbac0f7dbe8e	5599.00	INR	Success	order_Squ4UJLm3hznQU	pay_Squ4pjn422reU6	\N	2026-05-18 17:06:18.500501+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-18 17:06:49.364296+00	019dda81-85f0-7db5-bb97-8eb9853f4687
8786eef9-6865-4b7f-a08c-892f9d43f257	472d8778-9a41-490d-aba9-3ccb02ab3ff3	f202dafb-a8bc-4ffd-b38d-bbac0f7dbe8e	5599.00	INR	Success	pay_upi_a0a9ea70c215	\N	\N	2026-05-24 13:42:31.751142+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 13:42:31.751142+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- TOC entry 3637 (class 0 OID 16856)
-- Dependencies: 238
-- Data for Name: SaleTransactions; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."SaleTransactions" ("Id", "MemberId", "InventoryItemId", "Quantity", "UnitPrice", "TotalAmount", "PaymentMethod", "TransactionDate", "GymId", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "BranchId") FROM stdin;
59be43cf-701b-4f8e-ad7d-6df0b1712cd7	019e003d-ce36-77b0-9a77-a3c7d7c3caee	019e110c-3ee5-7de4-aba6-db25fbd61a54	1	2499.00	2499.00	Cash	2026-05-10 14:06:17.324231+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-10 14:06:17.588612+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 14:06:17.588612+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N
f4284750-f4bf-4acd-b918-b65564b94cdd	019dfe95-73ad-70b5-a585-ee4e4653d314	019e1417-3918-79f4-9b47-780d882bcb00	1	799.00	799.00	Card	2026-05-10 22:55:00.225969+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-10 22:55:00.456311+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-10 22:55:00.456311+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N
9fb70ba7-dff7-4b8b-baa7-1471b74b3748	019dfe95-73ad-70b5-a585-ee4e4653d314	019e1417-3918-79f4-9b47-780d882bcb00	2	799.00	1598.00	Card	2026-05-11 17:39:41.680867+00	472d8778-9a41-490d-aba9-3ccb02ab3ff3	2026-05-11 17:39:41.857146+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-11 17:39:41.857146+00	019dda81-85f0-7db5-bb97-8eb9853f4687	\N
\.


--
-- TOC entry 3631 (class 0 OID 16699)
-- Dependencies: 232
-- Data for Name: Staff; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."Staff" ("Id", "GymId", "StaffNumber", "FirstName", "LastName", "Email", "PhoneNumber", "UserId", "Role", "ProfilePictureUrl", "Specializations", "Bio", "ExperienceYears", "InstagramUrl", "PortfolioUrl", "ShiftTimings", "IsActive", "JoiningDate", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "BranchId", "IsCheckedIn", "LastCheckInTime") FROM stdin;
019e04cc-c04e-772b-bf9c-fa797cf7cc38	472d8778-9a41-490d-aba9-3ccb02ab3ff3	STF-47576854	Josh	Cbum	josh.cbum@trainer.com	9865321245	019e04cc-8249-7f36-8645-8e48fb84b648	1	\N	{}		1				t	2026-05-08 05:06:26.106549+00	2026-05-08 05:06:28.909089+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 02:01:17.305753+00	019dda81-85f0-7db5-bb97-8eb9853f4687	78c8547b-0380-4525-9603-c9551dfd64ff	t	2026-05-27 02:01:17.273559+00
\.


--
-- TOC entry 3642 (class 0 OID 17053)
-- Dependencies: 243
-- Data for Name: StaffAttendanceLogs; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."StaffAttendanceLogs" ("Id", "GymId", "BranchId", "StaffId", "CheckInTime", "CheckOutTime", "Notes", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
019e6720-50ba-77bb-86a5-19db854b9c5c	472d8778-9a41-490d-aba9-3ccb02ab3ff3	\N	019e04cc-c04e-772b-bf9c-fa797cf7cc38	2026-05-27 01:50:31.589787+00	2026-05-27 02:00:34.135813+00	\N	2026-05-27 01:50:31.676628+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 02:00:34.212388+00	019dda81-85f0-7db5-bb97-8eb9853f4687
019e672a-2af2-73b8-b0de-b20bd19aff0c	472d8778-9a41-490d-aba9-3ccb02ab3ff3	\N	019e04cc-c04e-772b-bf9c-fa797cf7cc38	2026-05-27 02:01:17.273893+00	\N		2026-05-27 02:01:17.305739+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-27 02:01:17.305739+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- TOC entry 3639 (class 0 OID 16961)
-- Dependencies: 240
-- Data for Name: StaffPayoutLogs; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."StaffPayoutLogs" ("Id", "GymId", "BranchId", "StaffId", "MonthKey", "BaseSalarySnapshot", "Commissions", "TotalPayout", "Status", "PayoutDate", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
\.


--
-- TOC entry 3640 (class 0 OID 16983)
-- Dependencies: 241
-- Data for Name: StaffPayrollRules; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."StaffPayrollRules" ("Id", "GymId", "BranchId", "StaffId", "BaseSalary", "PTCommissionRate", "RehabCommissionRate", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
5439ed80-f34f-4bd1-b796-f22f3074c02d	472d8778-9a41-490d-aba9-3ccb02ab3ff3	78c8547b-0380-4525-9603-c9551dfd64ff	019e04cc-c04e-772b-bf9c-fa797cf7cc38	30000.00	50.00	15.00	2026-05-24 08:11:23.838617+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 08:12:07.202467+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- TOC entry 3626 (class 0 OID 16544)
-- Dependencies: 227
-- Data for Name: SubscriptionRecords; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."SubscriptionRecords" ("Id", "GymId", "PlanId", "StartDate", "EndDate", "IsActive", "IsTrial", "PriceAtPurchase", "Notes", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
0d55f94f-8e0c-4d5b-89bb-2e76f557867c	472d8778-9a41-490d-aba9-3ccb02ab3ff3	019dda83-b356-7f2c-898b-10ccf19c919d	2026-04-29 18:36:02.17362+00	2026-05-29 18:36:02.17362+00	t	f	499.00	\N	2026-04-29 18:36:02.461365+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-04-29 18:36:26.868493+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
f202dafb-a8bc-4ffd-b38d-bbac0f7dbe8e	472d8778-9a41-490d-aba9-3ccb02ab3ff3	019dda84-db2b-7f76-bc22-fcc66e3c64b4	2026-05-18 17:06:14.418398+00	2026-07-18 17:06:14.418449+00	t	f	5599.00	UPI Renewed plan: GymForge Pro Plan via platform checkout portal	2026-05-18 17:06:18.50085+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-24 13:42:31.751175+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- TOC entry 3622 (class 0 OID 16454)
-- Dependencies: 223
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
--

COPY public."Users" ("Id", "FirstName", "LastName", "Email", "Phone", "PasswordHash", "GymId", "AddressId", "ProfilePictureUrl", "Role", "IsActive", "InvitationToken", "InvitationExpiry", "IsInvitationAccepted", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy") FROM stdin;
6d24cf54-fdc6-4d0f-fa4b-08de825db656	Neel	Parghi	Admin@gymforge.com	7383052505	$2a$11$pbcvjK/sBD2axHfmLUrX0u85eTevxypfYw4aAVjrlwg63sGjabLGO	\N	5d33044b-f4fc-4dfa-e777-08dea39056ef	https://res.cloudinary.com/dy1fcodtg/image/upload/v1777276401/gymforge/avatars/71411517-bcd8-47e6-8476-ced69bb67c6f_WhatsApp Image.jpg	1	t	\N	\N	f	2026-04-26 07:14:46+00	00000000-0000-0000-0000-000000000000	2026-04-27 02:23:25+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656
019e04cc-8249-7f36-8645-8e48fb84b648	Josh	Cbum	josh.cbum@trainer.com	9865321245	\N	472d8778-9a41-490d-aba9-3ccb02ab3ff3	\N		3	t	2782ab71-448b-4c3d-96c7-957210062fad	2026-05-14 23:36:09.913155+00	f	2026-05-07 23:36:28.909068+00	019dda81-85f0-7db5-bb97-8eb9853f4687	2026-05-07 23:36:28.909068+00	019dda81-85f0-7db5-bb97-8eb9853f4687
019dda81-85f0-7db5-bb97-8eb9853f4687	NEEL	PARGHI	neelparghi192@gmail.com	+917383052505	$2a$11$6JTheAF0BxGxmSueVqlw4e/5Qdh7lsZ/rT3wYymMAczuq7nvVCzDu	472d8778-9a41-490d-aba9-3ccb02ab3ff3	4a5e2e8d-f3dd-4db6-84f8-675b09d7d293		2	t	\N	\N	t	2026-04-29 18:30:15.067248+00	6d24cf54-fdc6-4d0f-fa4b-08de825db656	2026-05-09 07:34:27.829243+00	019dda81-85f0-7db5-bb97-8eb9853f4687
\.


--
-- TOC entry 3618 (class 0 OID 16398)
-- Dependencies: 219
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: gymforge_db_user
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
20260517172018_AddBranchScoping	10.0.0
20260517174519_AddBranchToEquipmentAndSales	10.0.0
20260522022620_AddAttendanceLog	10.0.0
20260524075021_AddStaffPayrollTables	10.0.0
20260524075255_FixPendingModelChanges	10.0.0
20260524134959_AddGymBillingSettings	10.0.0
20260524145506_AddCustomInvoicesTable	10.0.0
20260527014536_AddStaffAttendance	10.0.0
20260527154148_AddGstNoToSaaSConfiguration	10.0.0
\.


--
-- TOC entry 3335 (class 2606 OID 16419)
-- Name: Addresses PK_Addresses; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "PK_Addresses" PRIMARY KEY ("Id");


--
-- TOC entry 3409 (class 2606 OID 16945)
-- Name: AttendanceLogs PK_AttendanceLogs; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."AttendanceLogs"
    ADD CONSTRAINT "PK_AttendanceLogs" PRIMARY KEY ("Id");


--
-- TOC entry 3354 (class 2606 OID 16533)
-- Name: Branches PK_Branches; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Branches"
    ADD CONSTRAINT "PK_Branches" PRIMARY KEY ("Id");


--
-- TOC entry 3422 (class 2606 OID 17032)
-- Name: CustomInvoices PK_CustomInvoices; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."CustomInvoices"
    ADD CONSTRAINT "PK_CustomInvoices" PRIMARY KEY ("Id");


--
-- TOC entry 3391 (class 2606 OID 16805)
-- Name: Equipment PK_Equipment; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Equipment"
    ADD CONSTRAINT "PK_Equipment" PRIMARY KEY ("Id");


--
-- TOC entry 3370 (class 2606 OID 16645)
-- Name: GymMembers PK_GymMembers; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."GymMembers"
    ADD CONSTRAINT "PK_GymMembers" PRIMARY KEY ("Id");


--
-- TOC entry 3364 (class 2606 OID 16623)
-- Name: GymPlans PK_GymPlans; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."GymPlans"
    ADD CONSTRAINT "PK_GymPlans" PRIMARY KEY ("Id");


--
-- TOC entry 3346 (class 2606 OID 16490)
-- Name: Gyms PK_Gyms; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Gyms"
    ADD CONSTRAINT "PK_Gyms" PRIMARY KEY ("Id");


--
-- TOC entry 3395 (class 2606 OID 16829)
-- Name: InventoryItems PK_InventoryItems; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."InventoryItems"
    ADD CONSTRAINT "PK_InventoryItems" PRIMARY KEY ("Id");


--
-- TOC entry 3398 (class 2606 OID 16850)
-- Name: MaintenanceLogs PK_MaintenanceLogs; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."MaintenanceLogs"
    ADD CONSTRAINT "PK_MaintenanceLogs" PRIMARY KEY ("Id");


--
-- TOC entry 3383 (class 2606 OID 16739)
-- Name: MemberMeasurements PK_MemberMeasurements; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."MemberMeasurements"
    ADD CONSTRAINT "PK_MemberMeasurements" PRIMARY KEY ("Id");


--
-- TOC entry 3374 (class 2606 OID 16670)
-- Name: MemberSubscriptions PK_MemberSubscriptions; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."MemberSubscriptions"
    ADD CONSTRAINT "PK_MemberSubscriptions" PRIMARY KEY ("Id");


--
-- TOC entry 3387 (class 2606 OID 16763)
-- Name: PTAssignments PK_PTAssignments; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."PTAssignments"
    ADD CONSTRAINT "PK_PTAssignments" PRIMARY KEY ("Id");


--
-- TOC entry 3337 (class 2606 OID 16434)
-- Name: Plans PK_Plans; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "PK_Plans" PRIMARY KEY ("Id");


--
-- TOC entry 3350 (class 2606 OID 16513)
-- Name: RefreshTokens PK_RefreshTokens; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "PK_RefreshTokens" PRIMARY KEY ("Id");


--
-- TOC entry 3339 (class 2606 OID 16453)
-- Name: SaaSConfigurations PK_SaaSConfigurations; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SaaSConfigurations"
    ADD CONSTRAINT "PK_SaaSConfigurations" PRIMARY KEY ("Id");


--
-- TOC entry 3362 (class 2606 OID 16586)
-- Name: SaaSPaymentTransactions PK_SaaSPaymentTransactions; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SaaSPaymentTransactions"
    ADD CONSTRAINT "PK_SaaSPaymentTransactions" PRIMARY KEY ("Id");


--
-- TOC entry 3404 (class 2606 OID 16873)
-- Name: SaleTransactions PK_SaleTransactions; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SaleTransactions"
    ADD CONSTRAINT "PK_SaleTransactions" PRIMARY KEY ("Id");


--
-- TOC entry 3379 (class 2606 OID 16717)
-- Name: Staff PK_Staff; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "PK_Staff" PRIMARY KEY ("Id");


--
-- TOC entry 3428 (class 2606 OID 17065)
-- Name: StaffAttendanceLogs PK_StaffAttendanceLogs; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."StaffAttendanceLogs"
    ADD CONSTRAINT "PK_StaffAttendanceLogs" PRIMARY KEY ("Id");


--
-- TOC entry 3413 (class 2606 OID 16977)
-- Name: StaffPayoutLogs PK_StaffPayoutLogs; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."StaffPayoutLogs"
    ADD CONSTRAINT "PK_StaffPayoutLogs" PRIMARY KEY ("Id");


--
-- TOC entry 3417 (class 2606 OID 16995)
-- Name: StaffPayrollRules PK_StaffPayrollRules; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."StaffPayrollRules"
    ADD CONSTRAINT "PK_StaffPayrollRules" PRIMARY KEY ("Id");


--
-- TOC entry 3358 (class 2606 OID 16560)
-- Name: SubscriptionRecords PK_SubscriptionRecords; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SubscriptionRecords"
    ADD CONSTRAINT "PK_SubscriptionRecords" PRIMARY KEY ("Id");


--
-- TOC entry 3342 (class 2606 OID 16471)
-- Name: Users PK_Users; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "PK_Users" PRIMARY KEY ("Id");


--
-- TOC entry 3333 (class 2606 OID 16404)
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- TOC entry 3405 (class 1259 OID 16956)
-- Name: IX_AttendanceLogs_BranchId_CheckOutTime; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_AttendanceLogs_BranchId_CheckOutTime" ON public."AttendanceLogs" USING btree ("BranchId", "CheckOutTime");


--
-- TOC entry 3406 (class 1259 OID 16957)
-- Name: IX_AttendanceLogs_CheckInTime; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_AttendanceLogs_CheckInTime" ON public."AttendanceLogs" USING btree ("CheckInTime");


--
-- TOC entry 3407 (class 1259 OID 16958)
-- Name: IX_AttendanceLogs_MemberId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_AttendanceLogs_MemberId" ON public."AttendanceLogs" USING btree ("MemberId");


--
-- TOC entry 3351 (class 1259 OID 16597)
-- Name: IX_Branches_AddressId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_Branches_AddressId" ON public."Branches" USING btree ("AddressId");


--
-- TOC entry 3352 (class 1259 OID 16598)
-- Name: IX_Branches_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_Branches_GymId" ON public."Branches" USING btree ("GymId");


--
-- TOC entry 3418 (class 1259 OID 17048)
-- Name: IX_CustomInvoices_BranchId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_CustomInvoices_BranchId" ON public."CustomInvoices" USING btree ("BranchId");


--
-- TOC entry 3419 (class 1259 OID 17049)
-- Name: IX_CustomInvoices_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_CustomInvoices_GymId" ON public."CustomInvoices" USING btree ("GymId");


--
-- TOC entry 3420 (class 1259 OID 17050)
-- Name: IX_CustomInvoices_MemberId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_CustomInvoices_MemberId" ON public."CustomInvoices" USING btree ("MemberId");


--
-- TOC entry 3388 (class 1259 OID 16924)
-- Name: IX_Equipment_BranchId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_Equipment_BranchId" ON public."Equipment" USING btree ("BranchId");


--
-- TOC entry 3389 (class 1259 OID 16889)
-- Name: IX_Equipment_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_Equipment_GymId" ON public."Equipment" USING btree ("GymId");


--
-- TOC entry 3365 (class 1259 OID 16687)
-- Name: IX_GymMembers_AddressId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_GymMembers_AddressId" ON public."GymMembers" USING btree ("AddressId");


--
-- TOC entry 3366 (class 1259 OID 16907)
-- Name: IX_GymMembers_BranchId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_GymMembers_BranchId" ON public."GymMembers" USING btree ("BranchId");


--
-- TOC entry 3367 (class 1259 OID 16681)
-- Name: IX_GymMembers_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_GymMembers_GymId" ON public."GymMembers" USING btree ("GymId");


--
-- TOC entry 3368 (class 1259 OID 16774)
-- Name: IX_GymMembers_UserId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_GymMembers_UserId" ON public."GymMembers" USING btree ("UserId");


--
-- TOC entry 3343 (class 1259 OID 16599)
-- Name: IX_Gyms_AddressId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_Gyms_AddressId" ON public."Gyms" USING btree ("AddressId");


--
-- TOC entry 3344 (class 1259 OID 16600)
-- Name: IX_Gyms_OwnerUserId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_Gyms_OwnerUserId" ON public."Gyms" USING btree ("OwnerUserId");


--
-- TOC entry 3392 (class 1259 OID 16906)
-- Name: IX_InventoryItems_BranchId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_InventoryItems_BranchId" ON public."InventoryItems" USING btree ("BranchId");


--
-- TOC entry 3393 (class 1259 OID 16890)
-- Name: IX_InventoryItems_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_InventoryItems_GymId" ON public."InventoryItems" USING btree ("GymId");


--
-- TOC entry 3396 (class 1259 OID 16891)
-- Name: IX_MaintenanceLogs_EquipmentId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_MaintenanceLogs_EquipmentId" ON public."MaintenanceLogs" USING btree ("EquipmentId");


--
-- TOC entry 3380 (class 1259 OID 16775)
-- Name: IX_MemberMeasurements_MemberId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_MemberMeasurements_MemberId" ON public."MemberMeasurements" USING btree ("MemberId");


--
-- TOC entry 3381 (class 1259 OID 16776)
-- Name: IX_MemberMeasurements_RecordedById; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_MemberMeasurements_RecordedById" ON public."MemberMeasurements" USING btree ("RecordedById");


--
-- TOC entry 3371 (class 1259 OID 16682)
-- Name: IX_MemberSubscriptions_GymPlanId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_MemberSubscriptions_GymPlanId" ON public."MemberSubscriptions" USING btree ("GymPlanId");


--
-- TOC entry 3372 (class 1259 OID 16683)
-- Name: IX_MemberSubscriptions_MemberId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_MemberSubscriptions_MemberId" ON public."MemberSubscriptions" USING btree ("MemberId");


--
-- TOC entry 3384 (class 1259 OID 16777)
-- Name: IX_PTAssignments_MemberId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_PTAssignments_MemberId" ON public."PTAssignments" USING btree ("MemberId");


--
-- TOC entry 3385 (class 1259 OID 16778)
-- Name: IX_PTAssignments_TrainerId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_PTAssignments_TrainerId" ON public."PTAssignments" USING btree ("TrainerId");


--
-- TOC entry 3347 (class 1259 OID 16601)
-- Name: IX_RefreshTokens_Token; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_RefreshTokens_Token" ON public."RefreshTokens" USING btree ("Token");


--
-- TOC entry 3348 (class 1259 OID 16602)
-- Name: IX_RefreshTokens_UserId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_RefreshTokens_UserId" ON public."RefreshTokens" USING btree ("UserId");


--
-- TOC entry 3359 (class 1259 OID 16603)
-- Name: IX_SaaSPaymentTransactions_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_SaaSPaymentTransactions_GymId" ON public."SaaSPaymentTransactions" USING btree ("GymId");


--
-- TOC entry 3360 (class 1259 OID 16604)
-- Name: IX_SaaSPaymentTransactions_SubscriptionId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_SaaSPaymentTransactions_SubscriptionId" ON public."SaaSPaymentTransactions" USING btree ("SubscriptionId");


--
-- TOC entry 3399 (class 1259 OID 16923)
-- Name: IX_SaleTransactions_BranchId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_SaleTransactions_BranchId" ON public."SaleTransactions" USING btree ("BranchId");


--
-- TOC entry 3400 (class 1259 OID 16892)
-- Name: IX_SaleTransactions_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_SaleTransactions_GymId" ON public."SaleTransactions" USING btree ("GymId");


--
-- TOC entry 3401 (class 1259 OID 16893)
-- Name: IX_SaleTransactions_InventoryItemId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_SaleTransactions_InventoryItemId" ON public."SaleTransactions" USING btree ("InventoryItemId");


--
-- TOC entry 3402 (class 1259 OID 16894)
-- Name: IX_SaleTransactions_MemberId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_SaleTransactions_MemberId" ON public."SaleTransactions" USING btree ("MemberId");


--
-- TOC entry 3423 (class 1259 OID 17081)
-- Name: IX_StaffAttendanceLogs_BranchId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_StaffAttendanceLogs_BranchId" ON public."StaffAttendanceLogs" USING btree ("BranchId");


--
-- TOC entry 3424 (class 1259 OID 17082)
-- Name: IX_StaffAttendanceLogs_CheckInTime; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_StaffAttendanceLogs_CheckInTime" ON public."StaffAttendanceLogs" USING btree ("CheckInTime");


--
-- TOC entry 3425 (class 1259 OID 17083)
-- Name: IX_StaffAttendanceLogs_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_StaffAttendanceLogs_GymId" ON public."StaffAttendanceLogs" USING btree ("GymId");


--
-- TOC entry 3426 (class 1259 OID 17084)
-- Name: IX_StaffAttendanceLogs_StaffId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_StaffAttendanceLogs_StaffId" ON public."StaffAttendanceLogs" USING btree ("StaffId");


--
-- TOC entry 3410 (class 1259 OID 17001)
-- Name: IX_StaffPayoutLogs_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_StaffPayoutLogs_GymId" ON public."StaffPayoutLogs" USING btree ("GymId");


--
-- TOC entry 3411 (class 1259 OID 17002)
-- Name: IX_StaffPayoutLogs_StaffId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_StaffPayoutLogs_StaffId" ON public."StaffPayoutLogs" USING btree ("StaffId");


--
-- TOC entry 3414 (class 1259 OID 17003)
-- Name: IX_StaffPayrollRules_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_StaffPayrollRules_GymId" ON public."StaffPayrollRules" USING btree ("GymId");


--
-- TOC entry 3415 (class 1259 OID 17004)
-- Name: IX_StaffPayrollRules_StaffId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_StaffPayrollRules_StaffId" ON public."StaffPayrollRules" USING btree ("StaffId");


--
-- TOC entry 3375 (class 1259 OID 16905)
-- Name: IX_Staff_BranchId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_Staff_BranchId" ON public."Staff" USING btree ("BranchId");


--
-- TOC entry 3376 (class 1259 OID 16779)
-- Name: IX_Staff_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_Staff_GymId" ON public."Staff" USING btree ("GymId");


--
-- TOC entry 3377 (class 1259 OID 16780)
-- Name: IX_Staff_UserId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_Staff_UserId" ON public."Staff" USING btree ("UserId");


--
-- TOC entry 3355 (class 1259 OID 16605)
-- Name: IX_SubscriptionRecords_GymId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_SubscriptionRecords_GymId" ON public."SubscriptionRecords" USING btree ("GymId");


--
-- TOC entry 3356 (class 1259 OID 16606)
-- Name: IX_SubscriptionRecords_PlanId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_SubscriptionRecords_PlanId" ON public."SubscriptionRecords" USING btree ("PlanId");


--
-- TOC entry 3340 (class 1259 OID 16607)
-- Name: IX_Users_AddressId; Type: INDEX; Schema: public; Owner: gymforge_db_user
--

CREATE INDEX "IX_Users_AddressId" ON public."Users" USING btree ("AddressId");


--
-- TOC entry 3461 (class 2606 OID 16946)
-- Name: AttendanceLogs FK_AttendanceLogs_Branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."AttendanceLogs"
    ADD CONSTRAINT "FK_AttendanceLogs_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public."Branches"("Id") ON DELETE RESTRICT;


--
-- TOC entry 3462 (class 2606 OID 16951)
-- Name: AttendanceLogs FK_AttendanceLogs_GymMembers_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."AttendanceLogs"
    ADD CONSTRAINT "FK_AttendanceLogs_GymMembers_MemberId" FOREIGN KEY ("MemberId") REFERENCES public."GymMembers"("Id") ON DELETE CASCADE;


--
-- TOC entry 3433 (class 2606 OID 16534)
-- Name: Branches FK_Branches_Addresses_AddressId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Branches"
    ADD CONSTRAINT "FK_Branches_Addresses_AddressId" FOREIGN KEY ("AddressId") REFERENCES public."Addresses"("Id") ON DELETE CASCADE;


--
-- TOC entry 3434 (class 2606 OID 16539)
-- Name: Branches FK_Branches_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Branches"
    ADD CONSTRAINT "FK_Branches_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- TOC entry 3465 (class 2606 OID 17033)
-- Name: CustomInvoices FK_CustomInvoices_Branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."CustomInvoices"
    ADD CONSTRAINT "FK_CustomInvoices_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public."Branches"("Id");


--
-- TOC entry 3466 (class 2606 OID 17038)
-- Name: CustomInvoices FK_CustomInvoices_GymMembers_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."CustomInvoices"
    ADD CONSTRAINT "FK_CustomInvoices_GymMembers_MemberId" FOREIGN KEY ("MemberId") REFERENCES public."GymMembers"("Id") ON DELETE CASCADE;


--
-- TOC entry 3467 (class 2606 OID 17043)
-- Name: CustomInvoices FK_CustomInvoices_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."CustomInvoices"
    ADD CONSTRAINT "FK_CustomInvoices_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- TOC entry 3452 (class 2606 OID 16925)
-- Name: Equipment FK_Equipment_Branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Equipment"
    ADD CONSTRAINT "FK_Equipment_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public."Branches"("Id");


--
-- TOC entry 3453 (class 2606 OID 16806)
-- Name: Equipment FK_Equipment_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Equipment"
    ADD CONSTRAINT "FK_Equipment_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- TOC entry 3439 (class 2606 OID 16688)
-- Name: GymMembers FK_GymMembers_Addresses_AddressId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."GymMembers"
    ADD CONSTRAINT "FK_GymMembers_Addresses_AddressId" FOREIGN KEY ("AddressId") REFERENCES public."Addresses"("Id");


--
-- TOC entry 3440 (class 2606 OID 16908)
-- Name: GymMembers FK_GymMembers_Branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."GymMembers"
    ADD CONSTRAINT "FK_GymMembers_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public."Branches"("Id");


--
-- TOC entry 3441 (class 2606 OID 16646)
-- Name: GymMembers FK_GymMembers_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."GymMembers"
    ADD CONSTRAINT "FK_GymMembers_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- TOC entry 3442 (class 2606 OID 16781)
-- Name: GymMembers FK_GymMembers_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."GymMembers"
    ADD CONSTRAINT "FK_GymMembers_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id");


--
-- TOC entry 3430 (class 2606 OID 16491)
-- Name: Gyms FK_Gyms_Addresses_AddressId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Gyms"
    ADD CONSTRAINT "FK_Gyms_Addresses_AddressId" FOREIGN KEY ("AddressId") REFERENCES public."Addresses"("Id");


--
-- TOC entry 3431 (class 2606 OID 16496)
-- Name: Gyms FK_Gyms_Users_OwnerUserId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Gyms"
    ADD CONSTRAINT "FK_Gyms_Users_OwnerUserId" FOREIGN KEY ("OwnerUserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- TOC entry 3454 (class 2606 OID 16913)
-- Name: InventoryItems FK_InventoryItems_Branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."InventoryItems"
    ADD CONSTRAINT "FK_InventoryItems_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public."Branches"("Id");


--
-- TOC entry 3455 (class 2606 OID 16830)
-- Name: InventoryItems FK_InventoryItems_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."InventoryItems"
    ADD CONSTRAINT "FK_InventoryItems_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- TOC entry 3456 (class 2606 OID 16851)
-- Name: MaintenanceLogs FK_MaintenanceLogs_Equipment_EquipmentId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."MaintenanceLogs"
    ADD CONSTRAINT "FK_MaintenanceLogs_Equipment_EquipmentId" FOREIGN KEY ("EquipmentId") REFERENCES public."Equipment"("Id") ON DELETE CASCADE;


--
-- TOC entry 3448 (class 2606 OID 16740)
-- Name: MemberMeasurements FK_MemberMeasurements_GymMembers_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."MemberMeasurements"
    ADD CONSTRAINT "FK_MemberMeasurements_GymMembers_MemberId" FOREIGN KEY ("MemberId") REFERENCES public."GymMembers"("Id") ON DELETE CASCADE;


--
-- TOC entry 3449 (class 2606 OID 16745)
-- Name: MemberMeasurements FK_MemberMeasurements_Staff_RecordedById; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."MemberMeasurements"
    ADD CONSTRAINT "FK_MemberMeasurements_Staff_RecordedById" FOREIGN KEY ("RecordedById") REFERENCES public."Staff"("Id") ON DELETE SET NULL;


--
-- TOC entry 3443 (class 2606 OID 16671)
-- Name: MemberSubscriptions FK_MemberSubscriptions_GymMembers_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."MemberSubscriptions"
    ADD CONSTRAINT "FK_MemberSubscriptions_GymMembers_MemberId" FOREIGN KEY ("MemberId") REFERENCES public."GymMembers"("Id") ON DELETE CASCADE;


--
-- TOC entry 3444 (class 2606 OID 16676)
-- Name: MemberSubscriptions FK_MemberSubscriptions_GymPlans_GymPlanId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."MemberSubscriptions"
    ADD CONSTRAINT "FK_MemberSubscriptions_GymPlans_GymPlanId" FOREIGN KEY ("GymPlanId") REFERENCES public."GymPlans"("Id") ON DELETE CASCADE;


--
-- TOC entry 3450 (class 2606 OID 16764)
-- Name: PTAssignments FK_PTAssignments_GymMembers_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."PTAssignments"
    ADD CONSTRAINT "FK_PTAssignments_GymMembers_MemberId" FOREIGN KEY ("MemberId") REFERENCES public."GymMembers"("Id") ON DELETE CASCADE;


--
-- TOC entry 3451 (class 2606 OID 16769)
-- Name: PTAssignments FK_PTAssignments_Staff_TrainerId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."PTAssignments"
    ADD CONSTRAINT "FK_PTAssignments_Staff_TrainerId" FOREIGN KEY ("TrainerId") REFERENCES public."Staff"("Id") ON DELETE RESTRICT;


--
-- TOC entry 3432 (class 2606 OID 16514)
-- Name: RefreshTokens FK_RefreshTokens_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "FK_RefreshTokens_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- TOC entry 3437 (class 2606 OID 16587)
-- Name: SaaSPaymentTransactions FK_SaaSPaymentTransactions_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SaaSPaymentTransactions"
    ADD CONSTRAINT "FK_SaaSPaymentTransactions_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- TOC entry 3438 (class 2606 OID 16592)
-- Name: SaaSPaymentTransactions FK_SaaSPaymentTransactions_SubscriptionRecords_SubscriptionId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SaaSPaymentTransactions"
    ADD CONSTRAINT "FK_SaaSPaymentTransactions_SubscriptionRecords_SubscriptionId" FOREIGN KEY ("SubscriptionId") REFERENCES public."SubscriptionRecords"("Id") ON DELETE CASCADE;


--
-- TOC entry 3457 (class 2606 OID 16930)
-- Name: SaleTransactions FK_SaleTransactions_Branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SaleTransactions"
    ADD CONSTRAINT "FK_SaleTransactions_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public."Branches"("Id");


--
-- TOC entry 3458 (class 2606 OID 16874)
-- Name: SaleTransactions FK_SaleTransactions_GymMembers_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SaleTransactions"
    ADD CONSTRAINT "FK_SaleTransactions_GymMembers_MemberId" FOREIGN KEY ("MemberId") REFERENCES public."GymMembers"("Id") ON DELETE CASCADE;


--
-- TOC entry 3459 (class 2606 OID 16879)
-- Name: SaleTransactions FK_SaleTransactions_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SaleTransactions"
    ADD CONSTRAINT "FK_SaleTransactions_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- TOC entry 3460 (class 2606 OID 16884)
-- Name: SaleTransactions FK_SaleTransactions_InventoryItems_InventoryItemId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SaleTransactions"
    ADD CONSTRAINT "FK_SaleTransactions_InventoryItems_InventoryItemId" FOREIGN KEY ("InventoryItemId") REFERENCES public."InventoryItems"("Id") ON DELETE CASCADE;


--
-- TOC entry 3468 (class 2606 OID 17066)
-- Name: StaffAttendanceLogs FK_StaffAttendanceLogs_Branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."StaffAttendanceLogs"
    ADD CONSTRAINT "FK_StaffAttendanceLogs_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public."Branches"("Id") ON DELETE RESTRICT;


--
-- TOC entry 3469 (class 2606 OID 17071)
-- Name: StaffAttendanceLogs FK_StaffAttendanceLogs_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."StaffAttendanceLogs"
    ADD CONSTRAINT "FK_StaffAttendanceLogs_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- TOC entry 3470 (class 2606 OID 17076)
-- Name: StaffAttendanceLogs FK_StaffAttendanceLogs_Staff_StaffId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."StaffAttendanceLogs"
    ADD CONSTRAINT "FK_StaffAttendanceLogs_Staff_StaffId" FOREIGN KEY ("StaffId") REFERENCES public."Staff"("Id") ON DELETE CASCADE;


--
-- TOC entry 3463 (class 2606 OID 16978)
-- Name: StaffPayoutLogs FK_StaffPayoutLogs_Staff_StaffId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."StaffPayoutLogs"
    ADD CONSTRAINT "FK_StaffPayoutLogs_Staff_StaffId" FOREIGN KEY ("StaffId") REFERENCES public."Staff"("Id") ON DELETE CASCADE;


--
-- TOC entry 3464 (class 2606 OID 16996)
-- Name: StaffPayrollRules FK_StaffPayrollRules_Staff_StaffId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."StaffPayrollRules"
    ADD CONSTRAINT "FK_StaffPayrollRules_Staff_StaffId" FOREIGN KEY ("StaffId") REFERENCES public."Staff"("Id") ON DELETE CASCADE;


--
-- TOC entry 3445 (class 2606 OID 16918)
-- Name: Staff FK_Staff_Branches_BranchId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "FK_Staff_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES public."Branches"("Id");


--
-- TOC entry 3446 (class 2606 OID 16718)
-- Name: Staff FK_Staff_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "FK_Staff_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- TOC entry 3447 (class 2606 OID 16723)
-- Name: Staff FK_Staff_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "FK_Staff_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id");


--
-- TOC entry 3435 (class 2606 OID 16561)
-- Name: SubscriptionRecords FK_SubscriptionRecords_Gyms_GymId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SubscriptionRecords"
    ADD CONSTRAINT "FK_SubscriptionRecords_Gyms_GymId" FOREIGN KEY ("GymId") REFERENCES public."Gyms"("Id") ON DELETE CASCADE;


--
-- TOC entry 3436 (class 2606 OID 16566)
-- Name: SubscriptionRecords FK_SubscriptionRecords_Plans_PlanId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."SubscriptionRecords"
    ADD CONSTRAINT "FK_SubscriptionRecords_Plans_PlanId" FOREIGN KEY ("PlanId") REFERENCES public."Plans"("Id") ON DELETE CASCADE;


--
-- TOC entry 3429 (class 2606 OID 16472)
-- Name: Users FK_Users_Addresses_AddressId; Type: FK CONSTRAINT; Schema: public; Owner: gymforge_db_user
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "FK_Users_Addresses_AddressId" FOREIGN KEY ("AddressId") REFERENCES public."Addresses"("Id");


--
-- TOC entry 2148 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO gymforge_db_user;


--
-- TOC entry 2150 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO gymforge_db_user;


--
-- TOC entry 2149 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO gymforge_db_user;


--
-- TOC entry 2147 (class 826 OID 16390)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO gymforge_db_user;


-- Completed on 2026-05-27 15:46:12 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict znW3UdKHehB2cNWEyYublSr5HoXcO1whdli8xw031sR74BvJLjkvdg0YEehYln0

