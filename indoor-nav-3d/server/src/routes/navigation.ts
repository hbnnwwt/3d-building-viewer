import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const navigationRouter = Router();

navigationRouter.get('/:buildingId', async (req, res) => {
  const floors = await prisma.floor.findMany({
    where: { buildingId: req.params.buildingId },
    include: { navigationNodes: true }
  });
  res.json({ buildingId: req.params.buildingId, floors });
});

navigationRouter.put('/:buildingId', async (req, res) => {
  const { floorId, nodes } = req.body;
  await prisma.navigationNode.deleteMany({ where: { floorId } });
  if (nodes && nodes.length > 0) {
    await prisma.navigationNode.createMany({
      data: nodes.map((n: any) => ({
        floorId,
        posX: n.position.x,
        posY: n.position.y,
        posZ: n.position.z,
        nodeType: n.type,
        connections: JSON.stringify(n.connections || [])
      }))
    });
  }
  res.json({ success: true });
});