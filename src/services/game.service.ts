export class GameService {
    private static readonly BALANCE_KEY = 'balance';
    private static readonly DEFAULT_BALANCE = 50000;
    private static readonly AVAILABLE_AMOUNTS = [5, 10, 25, 50, 100, 500, 1000];
  
    public static getBalance(): number {
      const storedBalance = localStorage.getItem(this.BALANCE_KEY);
      return storedBalance ? parseInt(storedBalance, 10) : this.DEFAULT_BALANCE;
    }
  
    public static setBalance(amount: number): void {
      localStorage.setItem(this.BALANCE_KEY, amount.toString());
    }
  
    public static addToBalance(amount: number): number {
      const currentBalance = this.getBalance();
      const newBalance = currentBalance + amount;
      this.setBalance(newBalance);
      return newBalance;
    }
  
    public static reduceBalance(amount: number): number {
      const currentBalance = this.getBalance();
      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }
      const newBalance = currentBalance - amount;
      this.setBalance(newBalance);
      return newBalance;
    }
  
    public static spin(betAmount: number): number {
      if (!this.AVAILABLE_AMOUNTS.includes(betAmount)) {
        throw new Error('Invalid bet amount');
      }
      return this.reduceBalance(betAmount);
    }
  
    public static getAvailableAmounts(): number[] {
      return [...this.AVAILABLE_AMOUNTS];
    }
  }