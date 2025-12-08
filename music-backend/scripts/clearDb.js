const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('Clearing database records...');
  
  try {
    // Delete in order to respect foreign key constraints
    // 1. Delete dependent records first
    await prisma.comment.deleteMany();
    console.log('Deleted Comments');

    await prisma.like.deleteMany();
    console.log('Deleted Track Likes');

    await prisma.playlistLike.deleteMany();
    console.log('Deleted Playlist Likes');

    // 2. Handle Many-to-Many relations (Implicit in Prisma for Track <-> Playlist)
    // We can't easily delete the join table directly with implicit relations in the client,
    // but deleting the parent records usually handles it or we need to disconnect.
    // However, for a full clear, we can just delete the entities.
    // Note: If cascading deletes aren't set up in the DB, this might fail if we don't do it right.
    // But with SQLite and Prisma defaults, deleting the records usually works if we clear the relations.
    
    // Actually, for implicit many-to-many, we might need to be careful.
    // But let's try deleting Playlists first (which have tracks)
    // The relation is Playlist <-> Track.
    
    // Let's delete Playlists. The join table entries should be removed automatically by Prisma 
    // if we were deleting specific items, but deleteMany might not trigger middleware hooks.
    // However, for SQLite, we can just delete the records.
    
    await prisma.playlist.deleteMany();
    console.log('Deleted Playlists');

    await prisma.track.deleteMany();
    console.log('Deleted Tracks');

    // 3. Delete Users last
    await prisma.user.deleteMany();
    console.log('Deleted Users');

    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
