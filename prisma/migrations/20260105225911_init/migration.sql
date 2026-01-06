-- CreateTable
CREATE TABLE "Pesan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "teks" TEXT NOT NULL,

    CONSTRAINT "Pesan_pkey" PRIMARY KEY ("id")
);
