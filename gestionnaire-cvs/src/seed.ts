import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seedService = app.get(SeedService);

  console.log('Démarrage du remplissage de la base de données...');
  await seedService.seedDatabase();
  console.log('Base de données remplie avec succès !');

  // Fermeture du script
  await app.close();
}
bootstrap();
