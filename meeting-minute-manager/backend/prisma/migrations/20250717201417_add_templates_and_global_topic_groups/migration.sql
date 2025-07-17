-- CreateTable
CREATE TABLE "TemplateTopicGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "TemplateTopicGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinuteTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL,
    "createdBy" TEXT,
    "projectIds" TEXT[],

    CONSTRAINT "MinuteTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalTopicGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalTopicGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TemplateTopicGroup" ADD CONSTRAINT "TemplateTopicGroup_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MinuteTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
