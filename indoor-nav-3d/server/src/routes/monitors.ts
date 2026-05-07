import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const monitorsRouter = Router();

monitorsRouter.get('/:buildingId', async (req, res) => {
  const monitors = await prisma.monitor.findMany({
    where: { buildingId: req.params.buildingId }
  });
  res.json(monitors);
});

monitorsRouter.post('/', async (req, res) => {
  const { buildingId, floorId, type, value, unit, posX, posY, posZ } = req.body;
  const monitor = await prisma.monitor.create({
    data: {
      buildingId,
      floorId,
      monitorType: type,
      value,
      unit,
      posX,
      posY,
      posZ
    }
  });
  res.json(monitor);
});