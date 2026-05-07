import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const buildingsRouter = Router();

buildingsRouter.get('/', async (_, res) => {
  const buildings = await prisma.building.findMany({
    include: { floors: { orderBy: { order: 'asc' } } }
  });
  res.json(buildings);
});

buildingsRouter.post('/', async (req, res) => {
  const { name, info } = req.body;
  const building = await prisma.building.create({
    data: { name, info: info || '' }
  });
  res.json(building);
});

buildingsRouter.get('/:id', async (req, res) => {
  const building = await prisma.building.findUnique({
    where: { id: req.params.id },
    include: {
      floors: {
        orderBy: { order: 'asc' },
        include: {
          brands: true,
          navigationNodes: true
        }
      }
    }
  });
  if (!building) return res.status(404).json({ error: 'Not found' });
  res.json(building);
});

buildingsRouter.put('/:id', async (req, res) => {
  const { name, info } = req.body;
  const building = await prisma.building.update({
    where: { id: req.params.id },
    data: { name, info }
  });
  res.json(building);
});

buildingsRouter.delete('/:id', async (req, res) => {
  await prisma.building.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

buildingsRouter.post('/:id/floors', async (req, res) => {
  const { name, order, width, depth, floorHeight } = req.body;
  const floor = await prisma.floor.create({
    data: {
      buildingId: req.params.id,
      name,
      order: order || 0,
      width: width || 100,
      depth: depth || 100,
      floorHeight: floorHeight || 3
    }
  });
  res.json(floor);
});