import { Repository } from 'typeorm';
import { AlbumService } from './album.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Album } from './album.entity';
import { plainToInstance } from 'class-transformer';
import { AlbumDTO } from './album.dto';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};
const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
}));

const albumExample = {
  id: 1,
  name: 'Buscando América',
  cover:
    'https://i.pinimg.com/564x/aa/5f/ed/aa5fed7fac61cc8f41d1e79db917a7cd.jpg',
  releaseDate: '1984-08-01T00:00:00-05:00',
  description:
    'Buscando América es el primer álbum de la banda de Rubén Blades y Seis del Solar lanzado en 1984. La producción, bajo el sello Elektra, fusiona diferentes ritmos musicales tales como la salsa, reggae, rock, y el jazz latino. El disco fue grabado en Eurosound Studios en Nueva York entre mayo y agosto de 1983.',
  genre: 'Salsa',
  recordLabel: 'Elektra',
};
describe('AlbumService', () => {
  let albumService: AlbumService;
  let albumRepository: MockType<Repository<Album>>;

  beforeEach(async () => {
    const albumModule = await Test.createTestingModule({
      providers: [
        AlbumService,
        {
          provide: getRepositoryToken(Album),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    albumService = albumModule.get(AlbumService);
    albumRepository = albumModule.get(getRepositoryToken(Album));
  });
  it('deberia encontrar un album', async () => {
    albumRepository.findOne.mockReturnValue(albumExample);
    expect(await albumService.findOne(albumExample.id)).toEqual(albumExample);
  });

  it('deberia encontrar los albumes', async () => {
    let albumExample2 = albumExample;
    albumExample2.id = 2;
    const albums = [albumExample, albumExample2];
    albumRepository.find.mockReturnValue(albums);
    expect(await albumService.findAll()).toEqual(albums);
  });

  it('deberia crear un album', async () => {
    let album = albumExample;
    delete album.id;
    albumRepository.save.mockReturnValue(album);
    expect(await albumService.create(plainToInstance(AlbumDTO, album))).toBe(
      album,
    );
  });

  it('deberia actualizar un album', async () => {
    let album = albumExample;
    album.name = "Nuevo nombre";
    albumRepository.save.mockReturnValue(album);
    albumRepository.findOne.mockReturnValue(albumExample);
    expect(await albumService.update(album.id, plainToInstance(AlbumDTO, album))).toBe(
      album,
    );
  });

  it('deberia borrar un album', async () => {
    albumRepository.findOne.mockReturnValue(albumExample);
    expect(await albumService.delete(albumExample.id)).toBe(undefined);
  });
});