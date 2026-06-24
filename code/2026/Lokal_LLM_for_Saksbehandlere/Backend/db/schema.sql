CREATE TYPE "CaseStatus" AS ENUM ('Active', 'Archived', 'Deleted');

CREATE TABLE "User" (
    "UserId"        BIGSERIAL       PRIMARY KEY,
    "Email"         VARCHAR         NOT NULL,
    "Name"          VARCHAR,
    "Password_hash" VARCHAR         UNIQUE,
    "IsActive"      BOOLEAN         DEFAULT true
);

CREATE TABLE "Case" (
    "CaseId"      BIGSERIAL       PRIMARY KEY,
    "UserId"      BIGINT          NOT NULL REFERENCES "User"("UserId"),
    "Title"       VARCHAR         NOT NULL,
    "Description" VARCHAR,
    "Status"      "CaseStatus"    DEFAULT 'Active',
    "CreatedAt"   TIMESTAMP       NOT NULL DEFAULT now(),
    "IsActive"    BOOLEAN         DEFAULT true
);

CREATE TABLE "Chat" (
    "ChatId"      BIGSERIAL   PRIMARY KEY,
    "UserId"      BIGINT      NOT NULL REFERENCES "User"("UserId"),
    "CaseId"      BIGINT      REFERENCES "Case"("CaseId"),
    "Title"       VARCHAR     NOT NULL,
    "Description" VARCHAR,
    "CreatedAt"   TIMESTAMP   NOT NULL DEFAULT now(),
    "IsActive"    BOOLEAN     DEFAULT true
);

CREATE TABLE "ChatMessage" (
    "ChatMessageId" BIGSERIAL   PRIMARY KEY,
    "ChatId"        BIGINT      NOT NULL REFERENCES "Chat"("ChatId"),
    "MessageText"   TEXT,
    "IsUserMessage" BOOLEAN,
    "CreatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "File" (
    "FileId"             UUID        PRIMARY KEY DEFAULT auth.uid(),
    "UserId"             BIGINT      NOT NULL REFERENCES "User"("UserId"),
    "CaseId"             BIGINT      REFERENCES "Case"("CaseId"),
    "ChatId"             BIGINT      REFERENCES "Chat"("ChatId"),
    "ChatMessageId"      BIGINT      REFERENCES "ChatMessage"("ChatMessageId"),
    "OriginalFilename"   TEXT        NOT NULL,
    "FileExtension"      TEXT        NOT NULL,
    "StorageEnvironment" TEXT        NOT NULL,
    "UploadedAt"         TIMESTAMP   DEFAULT now(),
    "IsActive"           BOOLEAN     NOT NULL DEFAULT true
);

CREATE TABLE "FileProcessing" (
    "FileId"       UUID        PRIMARY KEY REFERENCES "File"("FileId"),
    "Status"       VARCHAR(20) NOT NULL DEFAULT 'UPLOADED',
    "ErrorMessage" TEXT,
    "UpdatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "FileText" (
    "Id"         SERIAL  PRIMARY KEY,
    "FileId"     UUID    NOT NULL REFERENCES "FileProcessing"("FileId"),
    "ChunkIndex" INTEGER NOT NULL DEFAULT 0,
    "Content"    TEXT    NOT NULL,
    UNIQUE ("FileId", "ChunkIndex")
);
