// import { withAccelerate } from '@prisma/extension-accelerate';
// // import { PrismaClient } from 'generated/prisma';
// import { PrismaClient } from '../../generated/prisma';

// const globalForPrisma = global as unknown as {
//   prisma: PrismaClient;
// };

// const prisma =
//   globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// export default prisma;

import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '../../generated/prisma';

// ✅ Sửa type để accept extended client
const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

// ✅ Tạo function để tạo extended client
function createPrismaClient() {
  return new PrismaClient().$extends(withAccelerate());
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

// ✅ Export type cho Better Auth adapter
export const prismaForAuth = new PrismaClient();
