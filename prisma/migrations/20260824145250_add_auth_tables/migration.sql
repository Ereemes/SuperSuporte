-- CreateTable
CREATE TABLE "Store" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "razaoSocial" TEXT,
    "cnpj" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aberta',
    "unidadeNegocio" TEXT,
    "grupoFinanceiro" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "regional" TEXT,
    "diretor" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "emailLoja" TEXT,
    "emailGerente" TEXT,
    "horaAbertura" TEXT,
    "horaFechamento" TEXT,
    "ip" TEXT,
    "linkInternet" TEXT,
    "operadora" TEXT,
    "tipoConexao" TEXT,
    "qtdePdvs" INTEGER,
    "servidorLocal" TEXT,
    "modeloEquipamento" TEXT,
    "versaoMegastore" TEXT,
    "versaoRetaguarda" TEXT,
    "versaoFrente" TEXT,
    "ambiente" TEXT,
    "homologacao" TEXT,
    "observacoes" TEXT,
    "ultimaAtualizacao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL,
    CONSTRAINT "Favorite_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProfilePermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    CONSTRAINT "ProfilePermission_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "details" TEXT,
    "topdeskRef" TEXT,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_codigo_key" ON "Store"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_storeId_key" ON "Favorite"("userId", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_type_key" ON "Profile"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilePermission_profileId_permission_key" ON "ProfilePermission"("profileId", "permission");
